import Joi from 'joi';
import needle from 'needle';

/**
* [getActiveSources description]
* @param  {Object}
* @param  {Function}
*/
export default function getActiveSources(args, done) {
  const schema = Joi.object().required().keys({
    pmpApiUrl: Joi.string().required(),
    request: Joi.object().required().keys({
      json: Joi.boolean().default(true).optional(),
      headers: Joi.object().optional()
    })
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const url = val.pmpApiUrl + '/sources/active';

    needle.get(url, val.request, (err, res) => {
      if (err) {
        done(err);
        return;
      }

      if (res.statusCode !== 200) {
        done(new Error('wrong statusCode ' + res.statusCode + ' ' + res.statusMessage));
        return;
      }

      done(null, {
        sources: res.body
      });
    });
  });
}
