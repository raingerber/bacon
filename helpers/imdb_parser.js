var imdb_parser = {};

var LineByLineReader = require('line-by-line');
var _ = require('lodash');

var neo4j = require('node-neo4j');
var db = new neo4j('http://neo4j:pw@localhost:7474');

var templates = {
	actor_node: "(actor:Actor {first_name: '<%- first_name %>', last_name: '<%- last_name %>', sex: 'female'})",
	film_node: "(:Film {title: '<%- title %>', year: '<%- year %>', year_mod: '<%- year_mod %>'})",
	acts_in: "CREATE UNIQUE (actor)-[r:ACTS_IN]->"
};

function get_tpl(tpl) {
	return _.template(templates[tpl]);
}

//MERGE (a:Actor { first: 'Bob', last: 'Saget' }) CREATE UNIQUE (a)-[r:ACTS_IN]->(f:Film {title: 'Full House'})

function cyphers(file_name) {
	
	db.cypherQuery("create (charlie { name:'Charlie Sheen', age:10 }) RETURN charlie", function(err, result) {
		
		if (err) throw err;

		console.log(result); // delivers an array of query results

		console.log(result.columns); // delivers an array of names of objects getting returned
		
	});
	
};

imdb_parser.import_actor_data = function(file_name) {
	
	var reader = new LineByLineReader(file_name),
		movie_titles;
	
	reset_movie_titles();
	
	set_reader_listener(ignore_header_lines);

	function set_reader_listener(listener) {
		reader.removeAllListeners('line');
		reader.on('line', listener);
	}
	
	function reset_movie_titles() {
		movie_titles = [];
	}

	// all lines up to '----			------' should be ignored
	function ignore_header_lines(line) {
		if (line !== '----			------') return;
		set_reader_listener(get_actor_name);
	}

	function get_actor_name(line) {
		reset_movie_titles();
		var temp = line.split(/\t+/, 2),
			name_arr = get_name_arr(temp[0]),
			new_listener = _.partial(_.modArgs(process_line, _.identity, _.trim), name_arr);
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
			.thru(_.partial(_.zipObject, ['last_name', 'first_name']))
			.value();
	}

	function process_line(name_arr, title_str) {
		 
		if (title_str.length === 0) {
			set_reader_listener(get_actor_name);
			link_films_to_actor(name_arr, movie_titles);
			return;
		}
		
		var processed = process_film_data(title_str);
				
		if (!processed.is_film) return;
			
		movie_titles.push(processed.data);

	}

	function process_film_data(title_str) {
		
		/*
			parsed[1] === '????' if no year is specified
			parsed[2] === 'dddd' year the film was released (either parsed[1] or parsed[2] will be empty)
			parsed[3] === a roman numeral for identifying when multiple same-named films were released that year
		*/
		
		var re = /\((\?\?\?\?)?(\d{4})?(?:\/([^\)]*))?\)/gi,
			parsed = re.exec(title_str);
			data = {
				'year': parsed[1] ? '' : parsed[2], 
				'year_mod': parsed[3] ? parsed[3] : '',
				'title': title_str.substr(0, parsed.index).trim()
			};

		return {
			data: data,
			is_film: is_film(data.title, title_str.substr(re.lastIndex).trim()) 
		};

	}
	
	function is_quotation(str) {
		return _.startsWith(str, "\"") && _.endsWith(str, "\"");
	}
	
	function is_film(title, remainder) {
		return !is_quotation(title) &&
			remainder.indexOf('(V)') != 0 && 
			remainder.indexOf('(TV)') != 0;
	}

	function link_films_to_actor(actor_obj, film_arr) {
				
		if (film_arr.length === 0) return;
		
  		var is_final = _.partial(_.eq, film_arr.length - 1),
			query = _.reduce(film_arr, function(result, val, key) {
				result += ' (actor)-[:ACTS_IN]-> ' + get_tpl('film_node')(val);
				if (!is_final(key)) result += ',';
				return result;
			}, 'CREATE ' + get_tpl('actor_node')(actor_obj) + ' CREATE UNIQUE');
		
		console.log(query);
		console.log();
		
		reader.pause();
		
		//return;
		
		db.cypherQuery(query, function(err, result) {
		
			reader.resume();
		
			if (err) throw err;

			//console.log(result); // delivers an array of query results
			
		});
		
	}

}

module.exports = imdb_parser;

