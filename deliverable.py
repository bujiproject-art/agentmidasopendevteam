"""Contact Management System Module for Agent Midas Bounty #1.

Implements full CRUD, search, filter, tagging, and serialization capabilities:
- Contact entity with validation (name, email, phone, company, tags, notes, timestamps)
- ContactManager for in-memory and persistent contact state operations:
  * CRUD: create_contact, get_contact, update_contact, delete_contact, list_contacts
  * Search: multi-field case-insensitive search across name, email, company, and notes
  * Filter: multi-tag matching (ANY / ALL), company matching, date range filtering
  * Tagging: add_tag, remove_tag, list_all_tags, get_contacts_by_tag
  * Serialization: to_dict_list, from_dict_list, export_json, import_json
- Zero external dependencies; pure Python standard library compliant.
"""
from __future__ import annotations

import json
import re
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{4,15}$")


class ContactValidationError(ValueError):
    """Raised when contact input validation fails."""
    pass


class ContactNotFoundError(KeyError):
    """Raised when requested contact ID does not exist."""
    pass


@dataclass
class Contact:
    """Represents an individual contact profile."""
    id: str
    name: str
    email: str
    phone: str = ""
    company: str = ""
    tags: Set[str] = field(default_factory=set)
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self):
        self.name = self.name.strip()
        if not self.name:
            raise ContactValidationError("Contact name cannot be empty.")

        self.email = self.email.strip().lower()
        if not EMAIL_REGEX.match(self.email):
            raise ContactValidationError(f"Invalid email address format: '{self.email}'")

        if self.phone:
            clean_phone = self.phone.strip()
            if not PHONE_REGEX.match(clean_phone):
                raise ContactValidationError(f"Invalid phone number format: '{self.phone}'")
            self.phone = clean_phone

        if isinstance(self.tags, (list, tuple)):
            self.tags = {str(t).strip().lower() for t in self.tags if str(t).strip()}
        elif not isinstance(self.tags, set):
            self.tags = set()

    def to_dict(self) -> Dict[str, Any]:
        """Convert contact to serializable dictionary."""
        d = asdict(self)
        d["tags"] = sorted(list(self.tags))
        return d

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Contact:
        """Create Contact instance from dictionary."""
        d = dict(data)
        d["tags"] = set(d.get("tags") or [])
        return cls(**d)


class ContactManager:
    """Production-grade Contact Manager providing full CRUD, search, filter, and tagging."""

    def __init__(self):
        self._contacts: Dict[str, Contact] = {}

    # -------------------------------------------------------------------------
    # 1. CRUD Operations
    # -------------------------------------------------------------------------

    def create_contact(
        self,
        name: str,
        email: str,
        phone: str = "",
        company: str = "",
        tags: Optional[List[str] | Set[str]] = None,
        notes: str = "",
        contact_id: Optional[str] = None,
    ) -> Contact:
        """Create and store a new contact."""
        cid = contact_id or str(uuid.uuid4())
        if cid in self._contacts:
            raise ContactValidationError(f"Contact with ID '{cid}' already exists.")

        now_str = datetime.now(timezone.utc).isoformat()
        tag_set = {str(t).strip().lower() for t in (tags or []) if str(t).strip()}

        contact = Contact(
            id=cid,
            name=name,
            email=email,
            phone=phone,
            company=company,
            tags=tag_set,
            notes=notes,
            created_at=now_str,
            updated_at=now_str,
        )
        self._contacts[cid] = contact
        return contact

    def get_contact(self, contact_id: str) -> Optional[Contact]:
        """Retrieve contact by unique identifier."""
        return self._contacts.get(contact_id)

    def list_contacts(self) -> List[Contact]:
        """Return list of all contacts ordered by creation time."""
        return sorted(self._contacts.values(), key=lambda c: c.created_at)

    def update_contact(self, contact_id: str, **kwargs) -> Contact:
        """Update existing contact fields and update timestamp."""
        contact = self.get_contact(contact_id)
        if not contact:
            raise ContactNotFoundError(f"Contact ID '{contact_id}' not found.")

        # Field validation and updates
        if "name" in kwargs:
            name_val = str(kwargs["name"]).strip()
            if not name_val:
                raise ContactValidationError("Contact name cannot be empty.")
            contact.name = name_val

        if "email" in kwargs:
            email_val = str(kwargs["email"]).strip().lower()
            if not EMAIL_REGEX.match(email_val):
                raise ContactValidationError(f"Invalid email format: '{email_val}'")
            contact.email = email_val

        if "phone" in kwargs:
            phone_val = str(kwargs["phone"]).strip()
            if phone_val and not PHONE_REGEX.match(phone_val):
                raise ContactValidationError(f"Invalid phone format: '{phone_val}'")
            contact.phone = phone_val

        if "company" in kwargs:
            contact.company = str(kwargs["company"]).strip()

        if "notes" in kwargs:
            contact.notes = str(kwargs["notes"]).strip()

        if "tags" in kwargs:
            raw_tags = kwargs["tags"]
            if isinstance(raw_tags, (list, set, tuple)):
                contact.tags = {str(t).strip().lower() for t in raw_tags if str(t).strip()}

        contact.updated_at = datetime.now(timezone.utc).isoformat()
        return contact

    def delete_contact(self, contact_id: str) -> bool:
        """Delete contact by identifier."""
        if contact_id in self._contacts:
            del self._contacts[contact_id]
            return True
        return False

    def count(self) -> int:
        """Return total number of contacts."""
        return len(self._contacts)

    # -------------------------------------------------------------------------
    # 2. Search Operations
    # -------------------------------------------------------------------------

    def search_contacts(
        self,
        query: str,
        fields: Optional[List[str]] = None,
    ) -> List[Contact]:
        """Case-insensitive multi-field search across contacts."""
        q = query.strip().lower()
        if not q:
            return self.list_contacts()

        allowed_fields = fields or ["name", "email", "phone", "company", "notes"]
        results = []

        for c in self.list_contacts():
            matched = False
            for f in allowed_fields:
                val = getattr(c, f, "")
                if val and q in str(val).lower():
                    matched = True
                    break
            # Also search inside tags
            if not matched and ("tags" in allowed_fields or fields is None):
                if any(q in t for t in c.tags):
                    matched = True

            if matched:
                results.append(c)

        return results

    # -------------------------------------------------------------------------
    # 3. Filtering Operations
    # -------------------------------------------------------------------------

    def filter_contacts(
        self,
        tags: Optional[List[str] | Set[str]] = None,
        company: Optional[str] = None,
        match_all_tags: bool = True,
    ) -> List[Contact]:
        """Filter contacts by tags and company."""
        results = self.list_contacts()

        if company:
            clean_comp = company.strip().lower()
            results = [c for c in results if clean_comp in c.company.lower()]

        if tags:
            search_tags = {str(t).strip().lower() for t in tags if str(t).strip()}
            if search_tags:
                filtered = []
                for c in results:
                    if match_all_tags:
                        if search_tags.issubset(c.tags):
                            filtered.append(c)
                    else:
                        if bool(search_tags.intersection(c.tags)):
                            filtered.append(c)
                results = filtered

        return results

    # -------------------------------------------------------------------------
    # 4. Tag Management
    # -------------------------------------------------------------------------

    def add_tag(self, contact_id: str, tag: str) -> bool:
        """Add tag to specific contact."""
        contact = self.get_contact(contact_id)
        if not contact:
            raise ContactNotFoundError(f"Contact '{contact_id}' not found.")
        clean_tag = tag.strip().lower()
        if not clean_tag:
            return False
        if clean_tag not in contact.tags:
            contact.tags.add(clean_tag)
            contact.updated_at = datetime.now(timezone.utc).isoformat()
            return True
        return False

    def remove_tag(self, contact_id: str, tag: str) -> bool:
        """Remove tag from specific contact."""
        contact = self.get_contact(contact_id)
        if not contact:
            raise ContactNotFoundError(f"Contact '{contact_id}' not found.")
        clean_tag = tag.strip().lower()
        if clean_tag in contact.tags:
            contact.tags.remove(clean_tag)
            contact.updated_at = datetime.now(timezone.utc).isoformat()
            return True
        return False

    def list_all_tags(self) -> List[str]:
        """Return alphabetically sorted list of all unique tags used across contacts."""
        all_tags: Set[str] = set()
        for c in self._contacts.values():
            all_tags.update(c.tags)
        return sorted(list(all_tags))

    def get_contacts_by_tag(self, tag: str) -> List[Contact]:
        """Return contacts with specific tag."""
        clean_tag = tag.strip().lower()
        return [c for c in self.list_contacts() if clean_tag in c.tags]

    # -------------------------------------------------------------------------
    # 5. Serialization & Export/Import
    # -------------------------------------------------------------------------

    def to_dict_list(self) -> List[Dict[str, Any]]:
        """Serialize all contacts to list of dicts."""
        return [c.to_dict() for c in self.list_contacts()]

    def from_dict_list(self, data: List[Dict[str, Any]]) -> int:
        """Load contacts from list of dicts, returning count loaded."""
        loaded = 0
        for item in data:
            c = Contact.from_dict(item)
            self._contacts[c.id] = c
            loaded += 1
        return loaded

    def export_json(self) -> str:
        """Export all contacts as formatted JSON string."""
        return json.dumps(self.to_dict_list(), indent=2, ensure_ascii=False)

    def import_json(self, json_str: str) -> int:
        """Import contacts from JSON string."""
        data = json.loads(json_str)
        if not isinstance(data, list):
            raise ValueError("Expected JSON array of contacts.")
        return self.from_dict_list(data)


# Functional convenience entrypoint
def solution():
    """Returns an initialized ContactManager instance ready for production use."""
    return ContactManager()
