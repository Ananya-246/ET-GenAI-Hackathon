import chromadb
from chromadb.utils import embedding_functions

client = chromadb.Client()

ef = embedding_functions.DefaultEmbeddingFunction()

collection = client.get_or_create_collection(
    name="et_articles",
    embedding_function=ef
)

def add_articles(articles):
    collection.add(
        documents=[a["title"] + " " + a.get("summary", "") for a in articles],
        metadatas=[{"category": a["category"], "id": str(a["id"])} for a in articles],
        ids=[str(a["id"]) for a in articles]
    )

def search_articles(query, n_results=6):
    results = collection.query(query_texts=[query], n_results=n_results)
    return results