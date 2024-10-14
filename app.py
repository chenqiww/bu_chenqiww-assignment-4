from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

# Fetch dataset and initialize vectorizer and LSA
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data

stop_words = stopwords.words('english')
vectorizer = TfidfVectorizer(stop_words=stop_words)
X = vectorizer.fit_transform(documents)

n_components = 100  # Number of dimensions to reduce to
lsa = TruncatedSVD(n_components=n_components)
X_reduced = lsa.fit_transform(X)


def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    # Transform the query into the same vector space
    query_tfidf = vectorizer.transform([query])
    query_lsa = lsa.transform(query_tfidf)

    # Compute cosine similarities
    similarities = cosine_similarity(query_lsa, X_reduced)[0]

    # Get the top 5 documents
    top_indices = similarities.argsort()[::-1][:5]
    top_similarities = similarities[top_indices]
    top_documents = [documents[i] for i in top_indices]

    return top_documents, top_similarities.tolist(), top_indices.tolist()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices})


if __name__ == '__main__':
    app.run(debug=True)
