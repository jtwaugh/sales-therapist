class SandboxRouter:
    def db_for_read(self, model, **hints):
        return hints.get('instance_db', 'default')

    def db_for_write(self, model, **hints):
        return hints.get('instance_db', 'default')

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True