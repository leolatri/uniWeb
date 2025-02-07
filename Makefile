all: start

start:
	@node ./registration_page/registration-app/server.js

format:
	@clang-format -i ./registration_page/*.html ./sing_page/*.html ./tests_page/*.html ./theory_page/*.html ./theory_page/topics/*.html

	
