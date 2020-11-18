# Airsift

Version 3 of the airsift pollution data science platform hosted by citizensense.co.uk 

.. image:: https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg
     :target: https://github.com/pydanny/cookiecutter-django/
     :alt: Built with Cookiecutter Django
.. image:: https://img.shields.io/badge/code%20style-black-000000.svg
     :target: https://github.com/ambv/black
     :alt: Black code style

### Local deployment and development

Developing this app requires the following tools:

- Git version control system
- Yarn package manager
- Docker (or your own Postgres server and configuration details in `.env`)
- Python
- Pip package manager

First, copy `.env.template` to `.env` in the root.

Then run the following commands:

```shell
# Optional: prepare a python environment with the right packages
python3.8 -m venv <virtual env path>
source <virtual env path>/bin/activate

# Install python dependencies
pip install -r requirements/local.txt

# Install frontend dependencies
yarn

# Provision a postgres database for the app to work with
docker-compose -f docker-compose.yml up

# Configure the app's database
python manage.py migrate

# Create an admin user
python manage.py createsuperuser

# Start the app up
python manage.py runserver 0.0.0.0:8000
```

### Deploy to server

TODO:

### Settings

http://cookiecutter-django.readthedocs.io/en/latest/settings.html

### Basic Commands

#### Setting Up Your Users

* To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

* To create an **superuser account**, use this command::

```shell
python manage.py createsuperuser
```

For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

#### Type checks

Running type checks with mypy:

```shell
mypy airsift
```

#### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report::

```shell
coverage run -m pytest
coverage html
open htmlcov/index.html
```

#### Running tests with py.test

```shell
pytest
```

#### Live reloading and Sass CSS compilation

Moved to `Live reloading and SASS compilation`: http://cookiecutter-django.readthedocs.io/en/latest/live-reloading-and-sass-compilation.html



