## build.sh - build script for the History Menu ################################
################################################################################
## 
## param webpack - path to the Webpack's webpack.js file
## param compiler - path to the Google Closure Compiler's compiler.jar file
##
## Requirements:
##  - Java with Google Closure Compiler (java command)
##  - NodeJS with Webpack (nodejs command)
##  - Recommended Ubuntu 14.04 (Not tried on other platforms)
##
## Author: Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com | http://layv.net)
## License: GNU GPL version 3, see LICENSE for details
##
################################################################################

# Extract parameters from the command line
while [[ $# > 1 ]]
do
key="$1"
case $key in
	-w|--webpack)
	WEBPACK="$2"
	shift
	;;
	-c|--compiler)
	COMPILER="$2"
	shift
	;;
	*)
	;;
esac
shift
done

# Check parameters
if [ -z "${COMPILER}" ] && [ -z "${WEBPACK}" ]
then
	echo "build.sh - build script for History Menu
Usage:
./build.sh 
    --webpack <path-to-webpack.js>
    --compiler <path-to-google-closure-compiler"
	exit
fi


if [ -z "${COMPILER}" ]
then
	echo "Error: Google Closure Compiler path was not specified";
	exit 1
fi

if [ -z "${WEBPACK}" ]
then
	echo "Error: Webpack path was not specified"
	exit 2
fi

# Clean the build directory
if [ -d "./build" ]
then
	rm "./build" -rf
fi

# Copy Chrome template
cp "./source/templates/chrome" "./build" -r

# Copy locales
cp "./source/_locales" "./build/_locales" -r

# Make CSS
touch "build/style.css"
cat "./source/libraries/lajw/ui/popup.css" >> "build/style.css"
cat "./source/libraries/lajw/ui/button.css" >> "build/style.css"
cat "./source/libraries/lajw/ui/input.css" >> "build/style.css"
cat "./source/libraries/lajw/ui/folder.css" >> "build/style.css"
cat "./source/libraries/lajw/ui/separator.css" >> "build/style.css"
cat "./source/style.css" >> "build/style.css"

# Copy Images
cp "./source/icons/" "./build/icons" -r
cp $(find "./source/libraries/lajw/ui/" -name "*.png") "./build"/ 

# Common Script
touch build/popup.tmp.js
cat "./source/libraries/lajw/instanceof.js" >> "./build/popup.tmp.js"
cat "./source/libraries/lajw/typecheck-release.js" >> "./build/popup.tmp.js"
cat "./source/libraries/lajw/utils.js" >> './build/popup.tmp.js'
cp "./build/popup.tmp.js" "./build/options.tmp.js"
cp "./build/popup.tmp.js" "./build/background.tmp.js"

# Popup Script
nodejs "${WEBPACK}" \
	--entry "./source/popup.js" \
	--output-file "./build/packed.js"
cat "./build/packed.js" >> "./build/popup.tmp.js"
java -jar "${COMPILER}" \
	--js "./build/popup.tmp.js" \
	--js_output_file "./build/popup.js" \
	--language_out "ES5_STRICT" \
	--compilation_level SIMPLE_OPTIMIZATIONS
rm "build/popup.tmp.js"

# Options script
rm "build/options.js"
nodejs "${WEBPACK}" \
	--entry "./source/options.js" \
	--output-file "./build/packed.js"
cat "./build/packed.js" >> "./build/options.tmp.js"
java -jar "${COMPILER}" \
	--js "./build/options.tmp.js" \
	--js_output_file "./build/options.js" \
	--language_out "ES5_STRICT" \
	--compilation_level SIMPLE_OPTIMIZATIONS
rm "build/options.tmp.js"

# Background Script
rm "build/background.js"
nodejs "${WEBPACK}" \
	--entry "./source/background.js" \
	--output-file "./build/packed.js"
cat "./build/packed.js" >> "./build/background.tmp.js"
java -jar "${COMPILER}" \
	--js "./build/background.tmp.js" \
	--js_output_file "./build/background.js" \
	--language_out "ES5_STRICT" \
	--compilation_level SIMPLE_OPTIMIZATIONS
rm "build/background.tmp.js"

rm "./build/packed.js"
