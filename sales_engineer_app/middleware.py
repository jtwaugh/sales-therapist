from django.db import connections
from django.db.utils import DEFAULT_DB_ALIAS

class DatabaseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        scenario = request.session.get('scenario')
        if scenario:
            db_name = f'sandbox_{scenario}'
            request.db_name = db_name if db_name in connections.databases else DEFAULT_DB_ALIAS
        else:
            request.db_name = DEFAULT_DB_ALIAS
        
        response = self.get_response(request)
        return response