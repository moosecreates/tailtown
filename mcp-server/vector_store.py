"""Vector Store for Tailtown RAG"""
import logging
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import faiss

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, config: dict):
        self.config = config
        self.model_name = config['embedding_model']
        logger.info(f"Loading embedding model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = None
        self.chunks = []
        logger.info(f"Vector store initialized (dimension: {self.dimension})")
    
    def build(self, chunks: List[Dict[str, Any]]):
        if not chunks:
            logger.warning("No chunks to index")
            return
        logger.info(f"Building index for {len(chunks)} chunks...")
        self.chunks = chunks
        texts = [chunk['content'] for chunk in chunks]
        logger.info("Generating embeddings...")
        embeddings = self.model.encode(texts, show_progress_bar=True)
        logger.info("Creating FAISS index...")
        self.index = faiss.IndexFlatIP(self.dimension)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype('float32'))
        logger.info(f"Index built with {self.index.ntotal} vectors")
    
    def search(self, query: str, top_k: int = 5, filter_type: str = 'all') -> List[Dict[str, Any]]:
        if self.index is None or self.index.ntotal == 0:
            logger.warning("Index is empty")
            return []
        query_embedding = self.model.encode([query])
        faiss.normalize_L2(query_embedding)
        scores, indices = self.index.search(query_embedding.astype('float32'), min(top_k * 3, self.index.ntotal))
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk = self.chunks[idx]
            if filter_type != 'all' and chunk['file_type'] != filter_type:
                continue
            results.append({**chunk, 'score': float(score)})
            if len(results) >= top_k:
                break
        return results
    
    def rebuild(self, chunks: List[Dict[str, Any]]):
        logger.info("Rebuilding vector index...")
        self.index = None
        self.chunks = []
        self.build(chunks)
