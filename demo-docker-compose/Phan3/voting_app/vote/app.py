from flask import Flask, render_template, request
import redis
import os

app = Flask(__name__)
redis_host = os.getenv("REDIS_HOST", "redis")
r = redis.Redis(host=redis_host, port=6379, db=0)

@app.route('/', methods=['GET', 'POST'])
def vote():
    if request.method == 'POST':
        vote = request.form.get('vote')
        r.lpush('votes', vote)
        return render_template('thankyou.html')
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)