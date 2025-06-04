class EmpresaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Si el usuario está autenticado y tiene empresa, la guardamos en request
        if request.user.is_authenticated and hasattr(request.user, 'empresa'):
            request.empresa = request.user.empresa
        else:
            request.empresa = None
        
        response = self.get_response(request)
        return response
