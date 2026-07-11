FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV DJANGO_SETTINGS_MODULE=budgetapp.settings
EXPOSE 3002
CMD ["sh", "-c", "python manage.py makemigrations expenses && python manage.py migrate && python manage.py runserver 0.0.0.0:3002"]