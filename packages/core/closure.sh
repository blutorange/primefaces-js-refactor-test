#!/usr/bin/bash

java -jar ~/Downloads/closure-compiler-v20240317.jar \
  --formatting=PRETTY_PRINT \
  --compilation_level=SIMPLE \
  --language_in=ECMASCRIPT_2020 \
  --language_out=ECMASCRIPT5 \
  --js='global.js' \
  --js='src/*.js' \
  --js='src/**/*.js' \
  --output_wrapper='(function(){%output%})();' \
  --assume_function_wrapper \
  --entry_point=global.js \
  --js_output_file dist/core.js
