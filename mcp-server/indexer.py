"""Tailtown Codebase Indexer"""
import os
import logging
from pathlib import Path
from typing import Dict, List, Any
from glob import glob
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

class TailtownIndexer:
    def __init__(self, config: dict):
        self.config = config
        self.project_root = Path(config['project_root']).resolve()
        self.chunks = []
        self.files_index = {}
        logger.info(f"Indexer initialized for: {self.project_root}")
    
    def index_all(self) -> Dict[str, Any]:
        stats = {'files_indexed': 0, 'chunks_created': 0, 'total_size': 0, 'by_type': {}}
        
        for file_type, patterns in self.config['index_patterns'].items():
            for pattern in patterns:
                files = self._find_files(pattern)
                for file_path in files:
                    if self._should_exclude(file_path):
                        continue
                    try:
                        chunks = self._index_file(file_path, file_type)
                        self.chunks.extend(chunks)
                        stats['files_indexed'] += 1
                        stats['chunks_created'] += len(chunks)
                        stats['total_size'] += os.path.getsize(file_path)
                        stats['by_type'][file_type] = stats['by_type'].get(file_type, 0) + 1
                    except Exception as e:
                        logger.warning(f"Failed to index {file_path}: {e}")
        
        logger.info(f"Indexing complete: {stats}")
        return stats
    
    def _find_files(self, pattern: str) -> List[Path]:
        full_pattern = str(self.project_root / pattern)
        matches = glob(full_pattern, recursive=True)
        return [Path(m) for m in matches if os.path.isfile(m)]
    
    def _should_exclude(self, file_path: Path) -> bool:
        rel_path = str(file_path.relative_to(self.project_root))
        for pattern in self.config['exclude_patterns']:
            pattern = pattern.replace('**/', '').replace('**', '').replace('*', '')
            if pattern in rel_path:
                return True
        return False
    
    def _index_file(self, file_path: Path, file_type: str) -> List[Dict[str, Any]]:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            return []
        
        rel_path = str(file_path.relative_to(self.project_root))
        self.files_index[rel_path] = {
            'path': rel_path,
            'type': file_type,
            'size': len(content),
            'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
            'language': self._detect_language(file_path)
        }
        
        return self._create_chunks(content, rel_path, file_type)
    
    def _create_chunks(self, content: str, file_path: str, file_type: str) -> List[Dict[str, Any]]:
        chunk_size = self.config['chunk_size']
        overlap = self.config['chunk_overlap']
        chunks = []
        lines = content.split('\n')
        current_chunk = []
        current_size = 0
        
        for line in lines:
            line_size = len(line)
            if current_size + line_size > chunk_size and current_chunk:
                chunk_content = '\n'.join(current_chunk)
                chunks.append({
                    'content': chunk_content,
                    'file_path': file_path,
                    'file_type': file_type,
                    'chunk_id': hashlib.md5(chunk_content.encode()).hexdigest(),
                    'language': self._detect_language(Path(file_path)),
                    'metadata': self._extract_metadata(chunk_content, file_type)
                })
                
                overlap_lines = []
                overlap_size = 0
                for prev_line in reversed(current_chunk):
                    if overlap_size + len(prev_line) > overlap:
                        break
                    overlap_lines.insert(0, prev_line)
                    overlap_size += len(prev_line)
                
                current_chunk = overlap_lines
                current_size = overlap_size
            
            current_chunk.append(line)
            current_size += line_size
        
        if current_chunk:
            chunk_content = '\n'.join(current_chunk)
            chunks.append({
                'content': chunk_content,
                'file_path': file_path,
                'file_type': file_type,
                'chunk_id': hashlib.md5(chunk_content.encode()).hexdigest(),
                'language': self._detect_language(Path(file_path)),
                'metadata': self._extract_metadata(chunk_content, file_type)
            })
        
        return chunks
    
    def _detect_language(self, file_path: Path) -> str:
        ext_map = {'.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', 
                   '.jsx': 'javascript', '.py': 'python', '.md': 'markdown', 
                   '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml', '.prisma': 'prisma'}
        return ext_map.get(file_path.suffix, '')
    
    def _extract_metadata(self, content: str, file_type: str) -> str:
        lines = content.split('\n')
        if file_type == 'code':
            for line in lines[:10]:
                if 'export const' in line or 'export function' in line or 'class ' in line:
                    return line.strip()
        if file_type == 'documentation':
            for line in lines[:5]:
                if line.startswith('#'):
                    return line.strip()
        return ''
    
    def get_all_chunks(self) -> List[Dict[str, Any]]:
        return self.chunks
    
    def get_file_content(self, file_path: str) -> Dict[str, Any]:
        full_path = self.project_root / file_path
        if not full_path.exists():
            return None
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                'path': file_path, 'content': content,
                'type': self.files_index.get(file_path, {}).get('type', 'unknown'),
                'size': len(content),
                'modified': datetime.fromtimestamp(os.path.getmtime(full_path)).isoformat(),
                'language': self._detect_language(full_path)
            }
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")
            return None
    
    def get_indexed_files(self, filter_type: str = 'all') -> List[Dict[str, Any]]:
        if filter_type == 'all':
            return list(self.files_index.values())
        return [info for info in self.files_index.values() if info['type'] == filter_type]
    
    def reindex(self) -> Dict[str, Any]:
        self.chunks = []
        self.files_index = {}
        return self.index_all()
