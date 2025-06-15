NAME = search-bar@aman

all: install

build:
	tsc
	mv dist/* .

schemas:
	glib-compile-schemas --strict --targetdir=schemas/ schemas

bundle: build
	gnome-extensions pack --force --extra-source=bangsearch.js .

install: uninstall bundle
	gnome-extensions install --force $(NAME).shell-extension.zip

uninstall:
	gnome-extensions uninstall $(NAME) || (echo "not installed")

.PHONY: all schemas build bundle install uninstall
