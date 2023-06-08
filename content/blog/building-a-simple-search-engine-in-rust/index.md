---
title: Building a Simple Search Engine in Rust
---

# Building a Simple Search Engine in Rust

> The search engine is still a work in progress, and I plan to add more features and supports in the future.

Rust is a systems programming language which I like very much that promises performance, reliability, and safety. To get familiar with rust and practice my developing skill, I started building a simple search engine that uses the tf-idf technique to do the searching. In this article, I will share my experience and what I learned.

## Overview

![the screenshot of the cli's usage](./usage.webp)
_The above screenshot shows the usage of the CLI._

The project includes a search engine and a command-line interface that utilizes it.
The search engine uses tf-idf as its searching technique, the tf-idf technique is a measure of how important a word is to a document in a collection or corpus.

The CLI has three subcommands: `index`, `search`, and `serve`:

- The `index` subcommand takes the path to a directory containing the documents that the user wishes to search and outputs a JSON format file containing the index result.
- The `search` subcommand takes a keyword phrase and the path to the index result and returns the paths to the top 10 relevant documents.
- The `serve` subcommand takes the path to the index result and spins up a server that provides an API for searching.

## Implementation

To implement the search engine, I followed the approach of an amazing programmer whose work I admire. I did not come up with everything by myself, but I made sure to understand all the concepts and write the code again on my own.

### Indexing

The `index` subcommand is responsible for indexing a set of documents.

To achieve this, the program reads each file in the directory path provide, extracts the text content, tokenize it and pre-calculate out the data that searching would need. After all the work is done, the program will store the result as a JSON format file at the path user provided to be further used.

![the screenshot of the demonstration of how to use the `index` subcommand](./indexing-start.webp)
_The above screenshot shows how the `index` subcommand is used._

![the screenshot of the cli when `index` subcommand has finished](./indexing-end.webp)
_The above screenshot shows how the indexing process finishes._

### Searching

The `search` subcommand is responsible for finding the top 10 documents that are most relevant to a given keyword phrase.

To achieve this, the program reads the index result from the JSON file, computes the tf-idf score of the words in the keyword phrase for each document, sums it up and the result becomes the tf-idf score of the document. The program then returns the paths to the top 10 documents with the highest scores.

![the screenshot of the demonstration of how to use the `search` subcommand](./searching.webp)
_The above screenshot shows how the `search` subcommand is used._

### Serving

The `serve` subcommand is responsible for providing an API for searching within the documents that is inside the index file specified.

To achieve this, the program spins up an HTTP server that listens on a given port and exposes one endpoint: `/api/search`. The endpoint accepts a GET request with a query parameter `q` that contains the keyword phrase to search for. The server then searches for the top 10 relevant documents and returns a JSON response with their paths.

> There's a lot of room for improvement and future work for this subcommand. I want to support directly serving upon directly without having to index separately, hot-reindexing, and more flexibilities.

![the screenshot of the demonstration of how to use the `serve` subcommand](./serving.webp)
_The above screenshot shows the CLI when the server is started._

## Conclusion

Building a simple search engine in Rust is a interesting and rewarding experience. I got more familiar with Rust's syntax, ownership and borrowing system, and got a sense of the idiomatic way to do thing in Rust. Rust's type system is a pleasure to work with, and its nature to emerge potential issues helped me to think more thoroughly and become a better programmer.

Although the search engine is very basic and has a lot of features yet to be done, I'm proud of what I have achieved so far. The project has given me a better understanding of how search engines work and the techniques they use to find relevant documents. I plan to continue improving the search engine by adding more features and supporting additional file formats.

If you're interested in learning Rust or building a search engine, I encourage you to give it a try. Rust's growing ecosystem and supportive community make it a great choice for systems programming, and building a search engine is a fun and challenging project that can help you sharpen your programming skills.

## Reference

The references I referred to work on this project are listed in [the Github repository of this project](https://github.com/nichtsam/search_engine).
