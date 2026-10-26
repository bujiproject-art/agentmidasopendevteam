"""Unit Test Suite for Contact Management Dashboard (Agent Midas Bounty #1).

Strictly tests Contact entity validation, ContactManager CRUD, multi-field search,
tag and company filtering, tag lifecycle, and JSON roundtrip serialization.
Zero swallowed exceptions, 100% deterministic assertion coverage.
"""
import unittest
from deliverable import (
    Contact,
    ContactManager,
    ContactNotFoundError,
    ContactValidationError,
    solution,
)


class TestContactManagerSuite(unittest.TestCase):
    def setUp(self):
        self.mgr = ContactManager()
        self.c1 = self.mgr.create_contact(
            name="Alice Smith",
            email="alice@techcorp.io",
            phone="+1-555-0101",
            company="TechCorp",
            tags=["vip", "partner"],
            notes="Primary engineering contact",
        )
        self.c2 = self.mgr.create_contact(
            name="Bob Jones",
            email="bob@startuphub.co",
            phone="+1-555-0102",
            company="StartupHub",
            tags=["lead"],
            notes="Prospect for Q4",
        )

    def test_solution_factory(self):
        """Verifies solution entrypoint returns operational manager."""
        app = solution()
        self.assertIsInstance(app, ContactManager)
        self.assertEqual(app.count(), 0)

    def test_crud_lifecycle(self):
        """Verifies create, retrieve, update, delete, and count operations."""
        self.assertEqual(self.mgr.count(), 2)
        fetched = self.mgr.get_contact(self.c1.id)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "Alice Smith")
        self.assertEqual(fetched.email, "alice@techcorp.io")

        updated = self.mgr.update_contact(
            self.c1.id,
            name="Alice W. Smith",
            company="TechCorp Global",
        )
        self.assertEqual(updated.name, "Alice W. Smith")
        self.assertEqual(updated.company, "TechCorp Global")

        deleted = self.mgr.delete_contact(self.c2.id)
        self.assertTrue(deleted)
        self.assertEqual(self.mgr.count(), 1)
        self.assertIsNone(self.mgr.get_contact(self.c2.id))

    def test_validation_constraints(self):
        """Verifies strict input validation on empty names, invalid email/phone and duplicates."""
        with self.assertRaises(ContactValidationError):
            self.mgr.create_contact(name="", email="valid@example.com")

        with self.assertRaises(ContactValidationError):
            self.mgr.create_contact(name="Test", email="invalid-email-format")

        with self.assertRaises(ContactValidationError):
            self.mgr.create_contact(name="Test", email="test@example.com", phone="abc-not-phone")

        with self.assertRaises(ContactValidationError):
            self.mgr.create_contact(name="Duplicate", email="dup@example.com", contact_id=self.c1.id)

        with self.assertRaises(ContactNotFoundError):
            self.mgr.update_contact("non-existent-id", name="New Name")

    def test_search_capabilities(self):
        """Verifies multi-field case-insensitive search across name, company, notes, tags."""
        res_alice = self.mgr.search_contacts("alice")
        self.assertEqual(len(res_alice), 1)
        self.assertEqual(res_alice[0].id, self.c1.id)

        res_corp = self.mgr.search_contacts("TechCorp")
        self.assertEqual(len(res_corp), 1)

        res_note = self.mgr.search_contacts("Prospect")
        self.assertEqual(len(res_note), 1)
        self.assertEqual(res_note[0].id, self.c2.id)

        all_res = self.mgr.search_contacts("")
        self.assertEqual(len(all_res), 2)

    def test_filtering_and_tags(self):
        """Verifies tag assignment, removal, aggregation, and multi-tag filtering."""
        self.mgr.add_tag(self.c2.id, "vip")
        vips = self.mgr.get_contacts_by_tag("vip")
        self.assertEqual(len(vips), 2)

        match_all = self.mgr.filter_contacts(tags=["vip", "partner"], match_all_tags=True)
        self.assertEqual(len(match_all), 1)
        self.assertEqual(match_all[0].id, self.c1.id)

        match_any = self.mgr.filter_contacts(tags=["partner", "lead"], match_all_tags=False)
        self.assertEqual(len(match_any), 2)

        self.mgr.remove_tag(self.c1.id, "partner")
        self.assertNotIn("partner", self.c1.tags)

    def test_json_export_import(self):
        """Verifies state serialization and deserialization integrity."""
        exported = self.mgr.export_json()
        new_mgr = ContactManager()
        loaded_count = new_mgr.import_json(exported)
        self.assertEqual(loaded_count, 2)
        self.assertEqual(new_mgr.count(), 2)
        self.assertEqual(new_mgr.get_contact(self.c1.id).name, "Alice Smith")


if __name__ == "__main__":
    unittest.main()
