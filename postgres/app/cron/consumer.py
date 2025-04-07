import logging
import backoff
import requests


def get_comment(data):
    try:
        return data['comment']
    except KeyError:
        return None

def get_rating(data):
    try:
        return data['details']['rating']
    except KeyError:
        return 5

def get_model(data):
    try:
        return data['model_id']
    except KeyError:
        return None

def get_content(snapshot):
    try:
        return snapshot['chat']['chat']['messages'][0]['content']
    except KeyError:
        return None


@backoff.on_exception(
    backoff.expo,
    requests.exceptions.RequestException,
    max_tries=5,
    giveup=lambda e: e.response is not None and e.response.status_code < 500
)
def retry(url, data):
    response = requests.post(url, json=data, timeout=30000)
    response.raise_for_status()
    print(response.text)

from sqlalchemy.orm import Session, DeclarativeBase

logger = logging.getLogger('cron')

from sqlalchemy import create_engine, Column, Text, BigInteger, Boolean, desc, false, Integer, and_, text, func
from sqlalchemy.dialects.postgresql import JSON

engine = create_engine("postgresql://user1:password@172.38.0.15:5432/webui-db", echo=True)

class Base(DeclarativeBase):
    pass

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Text, primary_key=True)
    user_id     = Column(Text)
    version     = Column(BigInteger, default=0)
    type        = Column(Text)
    data        = Column(JSON(none_as_null=True), nullable=True)
    meta        = Column(JSON, nullable=True)
    snapshot    = Column(JSON, nullable=True)
    created_at  = Column(BigInteger)
    updated_at  = Column(BigInteger)
    checked     = Column(Boolean, nullable=False, default=False)


session = Session(engine)

feedback = session.query(Feedback).filter(and_(Feedback.checked == False,
                                               Feedback.data['comment'].astext != None,
                                               Feedback.data['details', 'rating'].astext != None,
                                               Feedback.data['rating'].astext.cast(Integer) < 0)).order_by(desc(Feedback.updated_at)).first()

if feedback:
    question = get_content(feedback.snapshot)
    comment = get_comment(feedback.data)
    rating = get_rating(feedback.data)
    model = get_model(feedback.data)
    if question and comment and rating and model:
        print(f"[feedback] {comment}")
        x = {"comment": comment, "score": rating, "question": question, "model": model}
        retry("http://172.38.0.11:8000/v1/api/pub/feedback", x)
        feedback.checked = True
        session.commit()
        print("[feedback] 成功，資料回饋成功")
    else:
        print("[feedback] 錯誤，資料不完整")
        feedback.checked = None
        session.commit()

session.close()
engine.dispose()
