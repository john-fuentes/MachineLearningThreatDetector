from flask import Blueprint, request, jsonify
from models import db, VM
from datetime import datetime
from auth_util import require_auth


vm_bp = Blueprint("vm", __name__)

# =====================================================
# ✅ Create VM (Authenticated)
# =====================================================
@vm_bp.route("/vms", methods=["POST"])
@require_auth
def create_vm(payload):
    user_email = payload.get("email")

    data = request.json
    if not data:
        return {"error": "Missing request body"}, 400

    vm = VM(
        user_email=user_email,  # ✅ associate by email since NextAuth handles users
        vm_name=data.get("vm_name"),
        os_type=data.get("os_type"),
        status="stopped",
        cpu_cores=data.get("cpu_cores", 2),
        memory_gb=data.get("memory_gb", 4),
        storage_gb=data.get("storage_gb", 20),
        description=data.get("description"),
    )
    db.session.add(vm)
    db.session.commit()

    return jsonify({
        "message": "VM created successfully",
        "vm_id": vm.id
    }), 201

@vm_bp.route("/debug/token", methods=["GET"])
@require_auth
def debug_token(payload):
    return jsonify({"payload": payload}), 200


# =====================================================
# ✅ List all VMs for the logged-in user
# =====================================================
@vm_bp.route("/vms", methods=["GET"])
@require_auth
def list_vms(payload):
    user_email = payload.get("email")

    vms = VM.query.filter_by(user_email=user_email).all()
    return jsonify([
        {
            "id": v.id,
            "vm_name": v.vm_name,
            "os_type": v.os_type,
            "status": v.status,
            "cpu_cores": v.cpu_cores,
            "memory_gb": v.memory_gb,
            "storage_gb": v.storage_gb,
            "description": v.description,
            "created_at": v.created_at,
        }
        for v in vms
    ]), 200


# =====================================================
# ✅ Update VM
# =====================================================
@vm_bp.route("/vms/<int:vm_id>", methods=["PUT"])
@require_auth
def update_vm(payload, vm_id):
    user_email = payload.get("email")
    vm = VM.query.filter_by(id=vm_id, user_email=user_email).first()
    if not vm:
        return {"error": "VM not found"}, 404

    data = request.json or {}
    for field in ["status", "cpu_cores", "memory_gb", "storage_gb", "description"]:
        if field in data:
            setattr(vm, field, data[field])

    vm.last_accessed = datetime.utcnow()
    db.session.commit()

    return {"message": "VM updated successfully"}, 200


# =====================================================
# ✅ Delete VM
# =====================================================
@vm_bp.route("/vms/<int:vm_id>", methods=["DELETE"])
@require_auth
def delete_vm(payload, vm_id):
    user_email = payload.get("email")
    vm = VM.query.filter_by(id=vm_id, user_email=user_email).first()
    if not vm:
        return {"error": "VM not found"}, 404

    db.session.delete(vm)
    db.session.commit()

    return {"message": "VM deleted successfully"}, 200
