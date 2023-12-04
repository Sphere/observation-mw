const pino = require('pino');
export const logger = pino({
    level: 'info'
});
//Sample options for pino
// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');
// logger.debug('debug');
// logger.trace('trace');