#!/usr/bin/bash

# java -jar ~/Downloads/closure-compiler-v20240317.jar \
#   --formatting=PRETTY_PRINT \
#   --language_in=ECMASCRIPT_2020 \
#   --language_out=ECMASCRIPT_2016 \
#   --chunk_output_path_prefix dist/ \
#   --rename_prefix_namespace='PRIMEFACES_MODULE' \
#   \
#   --js='src/lib/ajax/**/*.js' \
#   --js='src/lib/core/**/*.js' \
#   --js='src/lib/widget/core/**/*.js' \
#   --chunk core:9 \
#   \
#   --js='src/lib/widget/common/**/*.js' \
#   --chunk components:3:core \
#   \
#   --js='src/lib/widget/extra/datepicker/**/*.js' \
#   --chunk datepicker:1:core \
#   \
#   --js='src/bundles/primefaces.js' \
#   --chunk global:1:core,components,datepicker \

java -jar ~/Downloads/closure-compiler-v20240317.jar \
  --formatting=PRETTY_PRINT \
  --compilation_level=SIMPLE \
  --language_in=ECMASCRIPT_2020 \
  --language_out=ECMASCRIPT5 \
  --js='src/**/*.js' \
  --entry_point=src/bundles/core.js \
  --js_output_file dist/core.js
