var posTypes = {
  'CC': { name: 'Coord Conjuncn', type: 'sentence', example: 'and,but,or' },
  'CD': { name: 'Cardinal number', type: 'punctuation', example: 'one,two' },
  'DT': { name: 'Determiner', type: 'sentence', example: 'the,some' },
  'EX': { name: 'Existential there', type: 'sentence', example: 'there' },
  'FW': { name: 'Foreign Word', type: 'sentence', example: 'mon dieu' },
  'IN': { name: 'Preposition', type: 'preposition', example: 'of,in,by' },
  'JJ': { name: 'Adjective', type: 'adjective', example: 'big' },
  'JJR': { name: 'Adj., comparative', type: 'adjective', example: 'bigger' },
  'JJS': { name: 'Adj., superlative', type: 'adjective', example: 'biggest' },
  'LS': { name: 'List item marker', type: 'punctuation', example: '1,One' },
  'MD': { name: 'Modal', type: 'sentence', example: 'can,should' },
  'NN': { name: 'Noun, sing. or mass', type: 'noun', example: 'dog' },
  'NNP': { name: 'Proper noun, sing.', type: 'noun', example: 'Edinburgh' },
  'NNPS': { name: 'Proper noun, plural', type: 'noun', example: 'Smiths' },
  'NNS': { name: 'Noun, plural', type: 'noun', example: 'dogs' },
  'POS': { name: 'Possessive ending', type: 'possessive', example: '\'s' },
  'PDT': { name: 'Predeterminer', type: 'sentence', example: 'all, both' },
  'PP$': { name: 'Possessive pronoun', type: 'pronoun', example: 'my,one\'s' },
  'PRP': { name: 'Personal pronoun', type: 'pronoun', example: 'I,you,she' },
  'PRP$': { name: 'Personal pronoun (possessive)', type: 'pronoun', example: 'yours,hers,his' },
  'RB': { name: 'Adverb', type: 'adverb', example: 'quickly' },
  'RBR': { name: 'Adverb, comparative', type: 'adverb', example: 'faster' },
  'RBS': { name: 'Adverb, superlative', type: 'adverb', example: 'fastest' },
  'RP': { name: 'Particle', type: 'sentence', example: 'up,off' },
  'TO': { name: 'to', type: 'sentence', example: 'to' },
  'UH': { name: 'Interjection', type: 'sentence', example: 'oh, oops' },
  'VB': { name: 'verb, base form', type: 'verb', example: 'eat' },
  'VBD': { name: 'verb, past tense', type: 'verb', example: 'ate' },
  'VBG': { name: 'verb, gerund', type: 'verb', example: 'eating' },
  'VBN': { name: 'verb, past part', type: 'verb', example: 'eaten' },
  'VBP': { name: 'Verb, present', type: 'verb', example: 'eat' },
  'VBZ': { name: 'Verb, present', type: 'verb', example: 'eats' },
  'WDT': { name: 'Wh-determiner', type: 'sentence', example: 'which,that' },
  'WP': { name: 'Wh pronoun', type: 'sentence', example: 'who,what' },
  'WP$': { name: 'Possessive-Wh', type: 'possessive', example: 'whose' },
  'WRB': { name: 'Wh-adverb', type: 'adverb', example: 'how,where' },
  'SYM': { name: 'Symbol', type: 'punctuation', example: '+,%,&' },
  ',': { name: 'Comma', type: 'punctuation', example: ',' },
  '.': { name: 'Sent-final punct', type: 'punctuation', example: '. ! ?' },
  ':': { name: 'Mid-sent punct', type: 'punctuation', example: ': \'' },
  ';': { name: 'Mid-sent semi-colon', type: 'punctuation', example: ';' },
  '!': { name: 'Exclamation', type: 'punctuation', example: '!' },
  '$': { name: 'Dollar sign', type: 'punctuation', example: '$' },
  '#': { name: 'Pound sign', type: 'punctuation', example: '#' },
  '"': { name: 'quote', type: 'punctuation', example: '"' },
  '`': { name: 'backtick', type: 'punctuation', example: '`' },
  '``': { name: 'double backtick', type: 'punctuation', example: '``' },
  '(': { name: 'Left paren', type: 'punctuation', example: '(' },
  ')': { name: 'Right paren', type: 'punctuation', example: ')' },
};

var posTagger = Npm.require('pos');
var queuedTimeout = false;


function restartTwitterMonitor() {
  var seconds = 20;
  console.log('Twitter disconnected, waiting %s seconds', seconds);
  if(queuedTimeout) {
    Meteor.clearTimeout(queuedTimeout);
    queuedTimeout = false;
  }
  queuedTimeout = Meteor.setTimeout(startTwitterMonitor, seconds * 1000);
}

function startTwitterMonitor() {

  //var restart = Meteor.wrapAsync(restartTwitterMonitor);
  var restart = restartTwitterMonitor;

  // connect the twitter api
  var twit = new Twitter({
    consumer_key: 'ZZL1Qe7mJkewcvVR1DM2Khnwm',
    consumer_secret: 'FzARUy5gc9vuhbC5pkLImgCk0EvhVONpmaPWbaO9wgCxZx5A04',
    access_token_key: '19946912-mQgwRwKJWMQfTQ94911xC4fokC1XfZMDD9zOTEd7m',
    access_token_secret: 'ely2vN71tfkhBfU12J3BL8NpVe2P01ayivzeCffP9XqIP'
  });

  var Fiber = Npm.require('fibers');
  var lexer = new posTagger.Lexer();
  var tagger = new posTagger.Tagger();

  function watchTwitter(search) {
    console.log('starting twitter stream watcher', search);
    var searches = search.split(',').map(function(s) { return s.trim().replace(/\s+/i); });
    
    twit.stream('statuses/filter', {
      language: 'en',
      track: searches.join(','),
    }, function(stream) {
        stream.on('http-error', Meteor.bindEnvironment(function(error) {
          console.log('http-error', error);
          restart();
        }));
        stream.on('error', Meteor.bindEnvironment(function(error) {
          console.log('error', error);
          restart();
        }));
        stream.on('end', Meteor.bindEnvironment(function(data) {
          console.log('ended');
          restart();
        }));

        stream.on('data', Meteor.bindEnvironment(function(data) {
          if(data.warning) {
            console.log('warning', data.warning);
          }

          if(data.timeout) {
            console.log('timeout', data.timeout);
            //restart();
          }

          if(!!data.text && (data.user && data.user.screen_name)) {
            if(data.text.substring(0, 10).indexOf('RT ') === -1) {
              var matches = 0;
              for(var pos in searches) {
                if(data.text.indexOf(searches[pos]) > -1) {
                  matches++;
                }
              };
              if(matches) {
                var text = data.text
                  .replace(/\s+/ig, ' ')
                  .replace(/([^\s]+)'([^\s]+)/ig, '$1’$2')
                  .replace(/(^|\s)https?:.+?($|\s)/ig, '$1[link]$2')
                  .replace(/#[^\s]+/ig, ' [hashtag] ')
                  .replace(/@[^\s]+/ig, ' [name] ');
                  //.toLowerCase();

                var words = lexer.lex(text);
                var tags = tagger.tag(words);

                var outText = tags.map(function(tag) { 
                  if(!posTypes[tag[1]]) { console.log('unfound tag', tag); }
                  return tag[1];
                }).join(' ');

                var now = (new Date()).getTime();
                Tweets.insert({
                  text: text,
                  tags: tags,
                  author: data.user.screen_name,
                  added: now
                });
              }
            }
          }
        }));
    });
  }

  watchTwitter("you're,your,yore,their,their,they're,yours,theirs,they'res,you'res,theres");
  //watchTwitter("they're,you're");
}

Meteor.startup(function () {
  startTwitterMonitor();
});