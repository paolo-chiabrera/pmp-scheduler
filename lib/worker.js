const argv = require('yargs').argv;

const PmpScraper = require('pmp-scraper');

const pmpScraper = new PmpScraper(JSON.parse(argv.options));

const pmpScraperEvents = [
  {
    type: 'log',
    name: 'scrape-start'
  }, {
    type: 'error',
    name: 'scrape-error'
  }, {
    type: 'log',
    name: 'scrape-end'
  }, {
    type: 'log',
    name: 'reindex-start'
  }, {
    type: 'error',
    name: 'reindex-error'
  }, {
    type: 'log',
    name: 'reindex-end'
  }, {
    type: 'error',
    name: 'image-error'
  }, {
    type: 'data',
    name: 'report'
  }, {
    type: 'data',
    name: 'stats'
  }
];

pmpScraperEvents.forEach(ev => {
  pmpScraper.on(ev.name, data => {
    process.send({
      data,
      type: ev.type,
      name: ev.name
    });
  });
});

pmpScraper.scrape({
  source: argv.source.toString()
}, err => {
  if (err) {
    process.send({
      data: err,
      type: 'error',
      name: 'scrape'
    });
    process.exit(1);
    return;
  }

  process.exit();
});
