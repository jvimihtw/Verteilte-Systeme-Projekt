import json

import jwt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Expense

JWT_SECRET = "password_123"


def expense_to_dict(expense):
    return {
        "id": expense.id,
        "title": expense.title,
        "amount": float(expense.amount),
        "category": expense.category,
        "date": str(expense.date),
    }


def get_user_id_from_token(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, JsonResponse(
            {"error": "Missing or invalid Authorization token"}, status=401
        )

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded["id"], None
    except jwt.PyJWTError:
        return None, JsonResponse(
            {"error": "Invalid or expired session"}, status=401
        )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def expense_list(request):
    user_id, error_response = get_user_id_from_token(request)
    if error_response:
        return error_response

    if request.method == "GET":
        expenses = Expense.objects.filter(user_id=user_id).order_by("-date")
        data = [expense_to_dict(e) for e in expenses]
        return JsonResponse({"service": "expenses", "data": data}, status=200)

    if request.method == "POST":
        try:
            body = json.loads(request.body)
            expense = Expense.objects.create(
                user_id=user_id,
                title=body.get("title", "Untitled"),
                amount=body.get("amount", 0),
                category=body.get("category", "Other"),
            )
            return JsonResponse(
                {"service": "expenses", "data": expense_to_dict(expense)}, status=201
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def expense_detail(request, expense_id):
    user_id, error_response = get_user_id_from_token(request)
    if error_response:
        return error_response

    try:
        expense = Expense.objects.get(id=expense_id, user_id=user_id)
        expense.delete()
        return JsonResponse({"service": "expenses", "deleted": expense_id}, status=200)
    except Expense.DoesNotExist:
        return JsonResponse({"error": "Expense not found"}, status=404)
