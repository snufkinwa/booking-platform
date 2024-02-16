from django.urls import path
from django.contrib import admin
from graphene_django.views import GraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),

    # GraphQL endpoint for all operations, including slot management
    path('graphql/', GraphQLView.as_view(graphiql=True)),
]
