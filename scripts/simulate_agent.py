#!/usr/bin/env python3
"""
PCMonitor test verisi üretici — Firestore REST API ile doğrudan yazar.

API route'ları yok; bu betik Agent'ın yaptığını taklit eder:
  1. machines/{machineGuid} dokümanını günceller (PATCH)
  2. machines/{machineGuid}/logins altına yeni kayıt ekler (POST)

Böylece panelde makine ve giriş kayıtları görünür.

Bağımlılık: requests (pip install requests)

Kullanım:
    python scripts/simulate_agent.py --machine-guid test-pc-01 --label "Test PC" --computer-name "TEST-PC"
"""

from __future__ import annotations

import argparse
import getpass
import platform
import socket
import sys
import uuid
from datetime import datetime, timezone
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("requests kütüphanesi gerekli: pip install requests", file=sys.stderr)
    sys.exit(1)

# Firebase config (herkese açık)
PROJECT_ID = "pcmonitors"
API_KEY = "AIzaSyBR1HtV434xMLnovDX26cTQNAWq259OKdw"
FIRESTORE_ROOT = "https://firestore.googleapis.com/v1"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def local_now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def string_fields(payload: dict, names: tuple) -> dict:
    return {name: {"stringValue": str(payload.get(name, ""))} for name in names}


def documents_url(relative_path: str) -> str:
    suffix = "/".join(quote(p, safe="") for p in relative_path.split("/") if p)
    return f"{FIRESTORE_ROOT}/projects/{PROJECT_ID}/databases/(default)/documents/{suffix}"


def patch_machine(machine_guid: str, payload: dict) -> tuple[int, str]:
    """machines/{machineGuid} dokümanını PATCH ile günceller."""
    machine_fields = ("machineGuid", "computerName", "username", "label", "lastSeenUtc")
    url = documents_url(f"machines/{machine_guid}")
    params = [(f"updateMask.fieldPaths", f) for f in machine_fields]
    params.append(("key", API_KEY))
    resp = requests.patch(
        url,
        params=params,
        json={"fields": string_fields(payload, machine_fields)},
        timeout=10,
    )
    return resp.status_code, resp.text[:200]


def create_login(machine_guid: str, login_id: str, payload: dict) -> tuple[int, str]:
    """machines/{machineGuid}/logins altına yeni kayıt ekler (POST)."""
    login_fields = (
        "event", "machineGuid", "username", "computerName",
        "osVersion", "agentVersion", "startedAtUtc", "startedAtLocal",
    )
    url = documents_url(f"machines/{machine_guid}/logins")
    resp = requests.post(
        url,
        params={"documentId": login_id, "key": API_KEY},
        json={"fields": string_fields(payload, login_fields)},
        timeout=10,
    )
    return resp.status_code, resp.text[:200]


def simulate(machine_guid: str, label: str, computer_name: str):
    now_utc = utc_now_iso()
    now_local = local_now_iso()

    machine_payload = {
        "machineGuid": machine_guid,
        "computerName": computer_name,
        "username": getpass.getuser(),
        "label": label,
        "lastSeenUtc": now_utc,
    }

    login_payload = {
        "event": "agent_started",
        "machineGuid": machine_guid,
        "username": getpass.getuser(),
        "computerName": computer_name,
        "osVersion": platform.platform(),
        "agentVersion": "0.1.0-test",
        "startedAtUtc": now_utc,
        "startedAtLocal": now_local,
    }

    print(f"{'='*60}")
    print(f"PCMonitor Test Verisi Üretici")
    print(f"  MachineGuid : {machine_guid}")
    print(f"  Etiket      : {label or '(yok — computerName kullanılır)'}")
    print(f"  Bilgisayar  : {computer_name}")
    print(f"  Kullanıcı   : {getpass.getuser()}")
    print(f"  Zaman (UTC) : {now_utc}")
    print(f"  Zaman (yerel): {now_local}")
    print(f"{'='*60}\n")

    # 1. Machine dokümanını güncelle
    print("[1/2] machines/ dokümanı güncelleniyor (PATCH)...")
    code, body = patch_machine(machine_guid, machine_payload)
    if code < 400:
        print(f"  ✓ Başarılı HTTP {code}")
    else:
        print(f"  ✗ HATA HTTP {code}: {body}")
        return 1

    # 2. Login kaydı ekle
    login_id = str(uuid.uuid4())
    print(f"\n[2/2] logins/ kaydı ekleniyor (POST, id={login_id[:8]}...)...")
    code, body = create_login(machine_guid, login_id, login_payload)
    if code < 400:
        print(f"  ✓ Başarılı HTTP {code}")
    else:
        print(f"  ✗ HATA HTTP {code}: {body}")
        return 1

    print(f"\n{'='*60}")
    print("✓ Tamamlandı! Panelde kontrol edin:")
    print(f"  /dashboard?device={machine_guid}")
    print(f"{'='*60}")
    return 0


def main():
    parser = argparse.ArgumentParser(description="PCMonitor test verisi üretici")
    parser.add_argument("--machine-guid", required=True, help="Makine GUID'i (benzersiz string)")
    parser.add_argument("--label", default="", help="Makine etiketi (örn. 'Test PC')")
    parser.add_argument("--computer-name", default="TEST-PC", help="Bilgisayar adı")
    args = parser.parse_args()
    sys.exit(simulate(args.machine_guid, args.label, args.computer_name))


if __name__ == "__main__":
    main()
