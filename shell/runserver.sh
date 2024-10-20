#!/bin/bash

# 現在のスクリプトのディレクトリを取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# srcディレクトリに移動
cd "$SCRIPT_DIR/../docs"

# HTTPサーバーをポート8000で起動
python3 -m http.server 8000
