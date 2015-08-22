var imdb_parser = {};

imdb_parser.import_actor_data = function(file_name) {
	
	var LineByLineReader = require('line-by-line'),
		reader = new LineByLineReader(file_name),
		_ = require('lodash');
	
	set_reader_listener(ignore_header_lines);

	function set_reader_listener(listener) {
		reader.removeAllListeners('line');
		reader.on('line', listener);
	}

	// all lines up to '----			------' should be ignored
	function ignore_header_lines(line) {
		if (line !== '----			------') return;
		set_reader_listener(get_actor_name);
	}

	function get_actor_name(line) {
		var temp = line.split(/\t+/, 2),
			name_arr = get_name_arr(temp[0]),
			new_listener = _.partial(_.modArgs(process_title, _.identity, _.trim), name_arr);
		new_listener(temp[1]);
		set_reader_listener(new_listener);	
	}

	function get_name_arr(name) {
		return _.chain(name)
			.split(/,\s+/)
			.map(_.trim)
			.thru(function(arr) {
				if (arr.length === 1) arr.unshift(''); // placeholder if the last name is missing
				return arr;
			})
			.thru(_.partial(_.zipObject, ['last', 'first']))
			.value();
	}

	function process_title(name_arr, title_str) {
		title_str.length === 0
			? set_reader_listener(get_actor_name)
			: link_film_to_actor(name_arr, process_film_data(title_str));
	}

	function process_film_data(title_str) {
		
		/*
			parsed[1] === '????' if no year is specified
			parsed[2] === 'dddd' year the film was released (either parsed[1] or parsed[2] will be empty)
			parsed[3] === a roman numeral for identifying when multiple same-named films were released that year
		*/
		
		var re = /\((\?\?\?\?)?(\d{4})?(?:\/([^\)]*))?\)/,
			parsed = re.exec(title_str);
			results = {
				'title': title_str.substr(0, parsed.index).trim(),
				'year': parsed[1] ? '' : parsed[2], 
				'year_mod': parsed[3] ? parsed[3] : ''
			};
		
		return results;

	}

	function link_film_to_actor(name_arr, film_arr) {

		if (film_arr.title[0] === "\"") return; // ignore TV shows (which have quotation marks)

		console.log(name_arr);
		console.log(film_arr);
		console.log();
		console.log();
		
	}

}

module.exports = imdb_parser;

