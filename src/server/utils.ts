export const callElasticWithErrorHandler = async (elasticFn: any, options: any) => {
    try {
        return await elasticFn(options);
    } catch (e) {
        console.error('ERROR', e);
        throw new Error('Internal error');
    }
}