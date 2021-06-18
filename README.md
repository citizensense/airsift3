# Airsift

Version 3 of the Airsift citizen-data air-quality platform. Part of the [AirKit](https://citizensense.net/projects/airkit/) toolkit by [Citizen Sense](https://citizensense.net/).

.. image:: https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg
     :target: https://github.com/pydanny/cookiecutter-django/
     :alt: Built with Cookiecutter Django
.. image:: https://img.shields.io/badge/code%20style-black-000000.svg
     :target: https://github.com/ambv/black
     :alt: Black code style

### Instructions for running the app on your system

Developing this app requires the following tools:

- Git version control system
- Yarn package manager
- Docker (or your own Postgres server and configuration details in `.env`)
- Python 3.8 (recommended: install using pyenv)
- Pip package manager

First, copy `.env.template` to `.env` in the root.

#### 1. Run the javascript app

```bash
cp .env.template .env
```

Then run the following commands in a terminal window:

```shell
# Install frontend dependencies
yarn

# Build the CSS and JS for the site
yarn watch
```

When you make changes to the Javascript files and CSS, changes will reload in the browser automagically.

#### 2. Run the django app

Now open another terminal window and let's set up the database and app:

```bash
# Provision a postgres database in the background for the app to work with.
docker-compose up -d

# Optional: prepare a python environment with the right packages
python3.8 -m venv .venv
source .venv/bin/activate

# Install python dependencies
pip install -r requirements/local.txt

# Configure the app's database
python manage.py migrate

# Load a slice of real data into the system
# (this might take a few minutes)
python manage.py sync_data --max 50

# If you, for some reason, want to run the system with ALL available data, run this command instead:
# python manage.py sync_data --all

# Set up the pages
python manage.py setup_pages

# Start the app up
python manage.py runserver 0.0.0.0:8000
```

You should now be able to see the site running at http://localhost:8000

### Deploy an update to airsift.citizensense.net

- Pushing new commits to `main` branch will trigger a new deployment
  - This is managed by a [Github action in this repo](./.github/workflows/deploy.yml)
  - It adds new images to the Github Container Registry
  - Then it instructs the server to restart the system with those updated images
  - `docker-compose` is used to configure and run these images
      - `production.yml` is used in production
      - you can run `local.yml` to emulate the production setup on your own machine
- The app is hosted at 209.250.252.222 and served at https://airsift.citizensense.net
  - Configure the server (VPS) at Vultr.com: https://my.vultr.com/subs/?id=b2a8d3fa-326d-43bf-aaab-41e0a168be68
- Server code is located at /var/www/airsift3

#### Server scripts

- View logs: `docker-compose -f /var/www/airsift3/production.yml logs`
- Ad-hoc django-admin commands: `docker-compose -f /var/www/airsift3/production.yml run --entrypoint python  -- django manage.py [...]`

### How to deploy the app to a new server

When you run the app for the first time, you will need to configure the pages:

```bash
python manage.py setup_pages
```

#### Configure the app on a server for the first time

- Expects a .env file in /var/www/airsift3 to contain the server's environment config.
- Expects a regular cron job to run `manage.py sync_data`

#### Install docker if required

See https://docs.docker.com/engine/install/ubuntu/.

#### Install yarn if required
 See https://classic.yarnpkg.com/en/docs/install/#debian-stable or https://www.hostinger.com/tutorials/how-to-install-yarn-on-ubuntu/.

#### App setup

Then... run the following commands to initiate the app on first try:

```shell
# Optional: prepare a python environment with the right packages
python3.8 -m venv <virtual env path>
source <virtual env path>/bin/activate

# Install PRODUCTION python dependencies
pip install -r requirements/production.txt

# Install frontend dependencies
yarn

# Configure the app's database
docker-compose up
python manage.py migrate

# Create an admin user
python manage.py createsuperuser

# Pre-run
python manage.py collectstatic

# Production app up
gunicorn config.wsgi:application --bind=136.244.105.217:8001 --bind=[::1]:8001
```

#### Production commands

Env is provided via `.env`.

```
# Run shell commands on Django
docker-compose -f /var/www/airsift3/production.yml run --entrypoint python  -- django manage.py shell

# Read the logs
docker-compose -f /var/www/airsift3/production.yml logs

# Restart the docker
docker-compose up --force-recreate
```

#### Troubleshooting

If you see errors relating to `GDAL` missing:

- try `sudo apt-get install gdal-bin`
- and also see `https://www.vultr.com/docs/install-the-postgis-extension-for-postgresql-on-ubuntu-linux` to configure postgres to use postGIS extensions.

### Settings

http://cookiecutter-django.readthedocs.io/en/latest/settings.html

### Basic Commands

#### Setting Up Your Users

* To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your email Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

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



