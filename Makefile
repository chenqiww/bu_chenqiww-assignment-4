install:
	pip install -r requirements.txt
	python -m nltk.downloader stopwords

run:
	python app.py
