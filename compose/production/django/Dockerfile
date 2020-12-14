
FROM python:3.8-slim-buster

ENV PYTHONUNBUFFERED 1

RUN apt-get update \
  # dependencies for building Python packages
  && apt-get install -y build-essential \
  # psycopg2 dependencies
  && apt-get install -y libpq-dev \
  # Gis dependencies
  && apt-get install -y binutils libproj-dev gdal-bin \
  # Translations dependencies
  && apt-get install -y gettext \
  # Build dependencies
  && apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_12.x -o ~/nodesource_setup.sh \
  && bash ~/nodesource_setup.sh \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y nodejs yarn  \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# Requirements are installed here to ensure they will be cached.
COPY ./requirements /requirements
RUN pip install --no-cache-dir -r /requirements/production.txt \
    && rm -rf /requirements

COPY ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint


COPY ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY package.json /app/
COPY yarn.lock /app/

RUN cd /app && yarn
COPY . /app
RUN cd /app && yarn build && rm -rf node_modules

WORKDIR /app

ENTRYPOINT ["/entrypoint"]
