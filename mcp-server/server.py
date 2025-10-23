#!/usr/bin/env python3
"""Tailtown RAG MCP Server"""
import asyncio
import json
import logging
from pathlib import Path
from typing import Any, Sequence
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource
from indexer import TailtownIndexer
from vector_store import VectorStore

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Server("tailtown-rag")
indexer = None
vector_store = None
config = None

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(name="search_codebase", description="Search Tailtown codebase and documentation",
             inputSchema={"type": "object", "properties": {
                 "query": {"type": "string"}, 
                 "filter_type": {"type": "string", "enum": ["all", "documentation", "code", "schemas", "config"], "default": "all"},
                 "max_results": {"type": "integer", "minimum": 1, "maximum": 10, "default": 5}
             }, "required": ["query"]}),
        Tool(name="get_file_context", description="Get full file content",
             inputSchema={"type": "object", "properties": {"file_path": {"type": "string"}}, "required": ["file_path"]}),
        Tool(name="list_indexed_files", description="List all indexed files",
             inputSchema={"type": "object", "properties": {"filter_type": {"type": "string", "default": "all"}}}),
        Tool(name="reindex", description="Reindex the codebase",
             inputSchema={"type": "object", "properties": {}})
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> Sequence[TextContent | ImageContent | EmbeddedResource]:
    try:
        if name == "search_codebase":
            query = arguments.get("query")
            filter_type = arguments.get("filter_type", "all")
            max_results = arguments.get("max_results", 5)
            results = vector_store.search(query, top_k=max_results, filter_type=filter_type)
            
            if not results:
                return [TextContent(type="text", text=f"No results found for: '{query}'")]
            
            response = f"# Search Results: '{query}'\n\n"
            for i, r in enumerate(results, 1):
                response += f"## {i}. {r['file_path']}\n**Type**: {r['file_type']} | **Score**: {r['score']:.2%}\n\n```{r.get('language', '')}\n{r['content']}\n```\n\n---\n\n"
            return [TextContent(type="text", text=response)]
        
        elif name == "get_file_context":
            file_path = arguments.get("file_path")
            content = indexer.get_file_content(file_path)
            if not content:
                return [TextContent(type="text", text=f"File not found: {file_path}")]
            response = f"# {file_path}\n\n```{content.get('language', '')}\n{content['content']}\n```"
            return [TextContent(type="text", text=response)]
        
        elif name == "list_indexed_files":
            filter_type = arguments.get("filter_type", "all")
            files = indexer.get_indexed_files(filter_type)
            response = f"# Indexed Files ({len(files)})\n\n"
            by_type = {}
            for f in files:
                by_type.setdefault(f['type'], []).append(f)
            for t, fl in sorted(by_type.items()):
                response += f"## {t.title()} ({len(fl)})\n" + "".join([f"- `{f['path']}`\n" for f in sorted(fl, key=lambda x: x['path'])])
            return [TextContent(type="text", text=response)]
        
        elif name == "reindex":
            stats = await asyncio.to_thread(indexer.reindex)
            await asyncio.to_thread(vector_store.rebuild, indexer.get_all_chunks())
            response = f"# Reindex Complete\n\n**Files**: {stats['files_indexed']}\n**Chunks**: {stats['chunks_created']}\n"
            return [TextContent(type="text", text=response)]
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return [TextContent(type="text", text=f"Error: {str(e)}")]

async def initialize():
    global indexer, vector_store, config
    logger.info("Initializing Tailtown RAG...")
    with open(Path(__file__).parent / "config.json") as f:
        config = json.load(f)
    indexer = TailtownIndexer(config)
    stats = await asyncio.to_thread(indexer.index_all)
    logger.info(f"Indexed {stats['files_indexed']} files")
    vector_store = VectorStore(config)
    await asyncio.to_thread(vector_store.build, indexer.get_all_chunks())
    logger.info("✅ RAG Server ready!")

async def main():
    await initialize()
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
