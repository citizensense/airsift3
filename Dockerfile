FROM python:3.8-slim-bullseye

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
  && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarn-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/yarn-archive-keyring.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y nodejs yarn \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# Requirements are installed here to ensure they will be cached.
COPY ./requirements /requirements
RUN pip install --no-cache-dir -r /requirements/production.txt \
    && rm -rf /requirements

# Copy package files and install frontend dependencies
COPY package.json /app/
COPY yarn.lock /app/

RUN cd /app && yarn

# Copy application code
COPY . /app

# Build frontend assets and remove node_modules to reduce image size
RUN cd /app && yarn build && rm -rf node_modules

WORKDIR /app

# Expose default port (Render will use PORT env var)
EXPOSE 10000

# Run the start script
CMD ["/app/start.sh"]

