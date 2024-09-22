#!/usr/bin/bash

java -jar ~/Downloads/closure-compiler-v20240317.jar \
  --formatting=PRETTY_PRINT \
  --compilation_level=SIMPLE \
  --language_in=ECMASCRIPT_2020 \
  --language_out=ECMASCRIPT_2016 \
  --js='src/common/*.js' \
  --js='src/common/**/*.js' \
  --output_wrapper='(function(){%output%})();' \
  --assume_function_wrapper \
  --entry_point=src/common/index.js \
  --js_output_file dist/components.js

for dir in src/extra/* ; do
  java -jar ~/Downloads/closure-compiler-v20240317.jar \
    --formatting=PRETTY_PRINT \
    --compilation_level=SIMPLE \
    --language_in=ECMASCRIPT_2020 \
    --language_out=ECMASCRIPT_2016 \
    --js="$dir/**/*.js" \
    --js="$dir/*.js" \
    --output_wrapper='(function(){%output%})();' \
    --assume_function_wrapper \
    --entry_point="$dir/index.js" \
    --js_output_file "dist/$(basename $dir).js"
done