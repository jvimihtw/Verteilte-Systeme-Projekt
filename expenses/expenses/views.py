import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Expense


def expense_to_dict(expense):
    return {
        "id": expense.id,
        "title": expense.title,
        "amount": float(expense.amount),
        "category": expense.category,
        "date": str(expense.date),
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def expense_list(request):
    if request.method == "GET":
        expenses = Expense.objects.all().order_by("-date")
        data = [expense_to_dict(e) for e in expenses]
        return JsonResponse({"service": "expenses", "data": data}, status=200)

    if request.method == "POST":
        try:
            body = json.loads(request.body)
            expense = Expense.objects.create(
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
    try:
        expense = Expense.objects.get(id=expense_id)
        expense.delete()
        return JsonResponse({"service": "expenses", "deleted": expense_id}, status=200)
    except Expense.DoesNotExist:
        return JsonResponse({"error": "Expense not found"}, status=404)
