#FROM postgres:14.6-bullseye
FROM postgres:16.8-bullseye

#RUN apk update && apk add gcc g++ make git patch perl perl-dev curl wget libpq-dev mandoc man-pages nano
#RUN curl -L http://xrl.us/cpanm > /bin/cpanm && chmod +x /bin/cpanm
#RUN cpanm App::cpm
#RUN cpanm DBD::Pg
#RUN cpanm DBI


# 建立使用者帳號
RUN adduser user1
RUN adduser user2
RUN adduser user3
RUN adduser user
RUN usermod -a -G root user


#WORKDIR /usr
RUN #cpm install Plack
ENV DIR /home/user
ENV PERL5LIB=/usr/local/lib/perl5
ENV PATH=/usr/local/bin:$PATH

# 安裝 check progress
RUN mkdir -p $DIR
WORKDIR $DIR

# ADD ./check_postgres-2.26.0.tar.gz /tmp
# RUN cd /tmp/check_postgres-2.26.0 && perl Makefile.PL && make && make install

RUN cd $DIR
# RUN mkdir postgres
# RUN cd postgres
# RUN perl /usr/local/bin/check_postgres.pl --symlinks


RUN --mount=type=cache,target=/var/cache/apt apt-get update && apt-get install -y --no-install-recommends postgresql-server-dev-all gcc musl-dev zip unzip python3-pip
RUN --mount=type=cache,target=/var/cache/apt apt-get install -y libxml2-dev libxslt-dev libffi-dev gcc musl-dev build-essential openssl libssl-dev curl git nano procps
# RUN apt-get install -y jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev
RUN --mount=type=cache,target=/var/cache/apt apt-get install -y net-tools netcat vim wget iputils-ping
RUN --mount=type=cache,target=/var/cache/apt apt-get install -y libaio1 libaio-dev
RUN --mount=type=cache,target=/var/cache/apt apt install cron tzdata -y


COPY --chown=user:user ./requirements.txt ./app $DIR/

RUN --mount=type=cache,mode=0755,target=/root/.cache/pip pip install --upgrade pip setuptools wheel
RUN --mount=type=cache,mode=0755,target=/root/.cache/pip pip install -r requirements.txt

RUN crontab -l | { cat; echo "*/3 * * * * /usr/bin/python3.9 /home/user/manage.py shell_plus < /home/user/cron/consumer.py"; } | crontab -
# RUN pip install --no-cache-dir -r requirements.txt

# 改變身份
USER user

EXPOSE 9097

#CMD ["cron", "-f"]