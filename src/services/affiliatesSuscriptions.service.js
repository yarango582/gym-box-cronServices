const { BaseService } = require('./base.service');
const { sendMail } = require('../utils/mailer');
const { sendSMS } = require('../utils/twilio/sender.util');
const { subjects } = require('../constants/subjects.constant');
const config = require('../config/config');
const AffiliatesSuscriptionModel = require('../models/affiliatesSuscription.model');
const { deactivateSuscriptionTemplate, subscriptionsThatWillBeDeactivatedTemplate } = require('../templates/email');
const { deactivateSuscriptionWppTemplate } = require('../templates/wpp');
const moment = require('moment');
class AffiliatesSuscriptionsService extends BaseService {

    constructor() {
        super("AffiliatesSuscriptionsService", config.services.affiliatesSuscriptions.cronTime);
    }

    async execute() {
        await this.deactivateSuscription();
        await this.subscriptionsThatWillBeDeactivated();
    }

    async deactivateSuscription() {
        // buscamos todas las suscripciones activas que ya pasaron 30 dias desde la fecha de pago
        // y  las desactivamos
        try {
            const today = new Date();

            const suscriptionsWithAffiliates = await AffiliatesSuscriptionModel.find({ activo: true })
                .populate('idAfiliado');

            const suscriptionsToDeactivate = [];
            suscriptionsWithAffiliates.forEach(suscription => {
                const date = new Date(suscription.fechaDePago);
                const dateOfPayment = moment(date).add(suscription.mesesPagados, 'months').toDate();
                if (today >= dateOfPayment) {
                    suscription.activo = false;
                    suscription.save();
                    suscriptionsToDeactivate.push(suscription);
                }
            });
            if (suscriptionsToDeactivate.length > 0) {
                const tableRows = suscriptionsToDeactivate.map((suscription) => {
                    return `
                        <tr>
                            <td>${suscription.idAfiliado.nombreCompleto}</td>
                            <td>${suscription.idAfiliado.numeroDocumento}</td>
                            <td>${suscription.idAfiliado.celular}</td>
                            <td>${new Date(suscription.fechaDePago).toISOString().slice(0, 10)}</td>
                            <td>${suscription.idAfiliado.sede}</td>
                        </tr>
                    `;
                }).join('');
                const html = deactivateSuscriptionTemplate(tableRows);
                sendMail(subjects.DEACTIVE_SUSCRIPTION, html);
            }
            console.info('No hay suscripciones para desactivar');
            return;
        } catch (error) {
            console.error(error);
        }
    }

    async subscriptionsThatWillBeDeactivated() {
        // buscamos todas las suscripciones que esten activas y que les falte 3 dias para el pago y enviamos email
        try {
            const today = moment(new Date()).format('YYYY-DD-MM');

            const suscriptions = await AffiliatesSuscriptionModel.find({ activo: true })
                .populate('idAfiliado');

            const suscriptionsToNotify = [];
            suscriptions.forEach(suscription => {
                const date = new Date(suscription.fechaDePago);
                const dateOfPayment = moment(date).add(suscription.mesesPagados, 'months').toDate();
                const threeDaysBefore = moment(dateOfPayment).subtract(3, 'days').format('YYYY-DD-MM');
                if (today === threeDaysBefore) {
                    suscriptionsToNotify.push(suscription);
                }
            });
            if (suscriptionsToNotify.length > 0) {
                const tableRows = suscriptionsToNotify.map(suscription => {
                    return `
                        <tr>
                            <td>${suscription.idAfiliado.nombreCompleto}</td>
                            <td>${suscription.idAfiliado.numeroDocumento}</td>
                            <td>${suscription.idAfiliado.celular}</td>
                            <td>${new Date(suscription.fechaDePago).toISOString().slice(0, 10)}</td>
                            <td>${suscription.idAfiliado.sede}</td>
                        </tr>
                    `;
                }).join('');
                const html = subscriptionsThatWillBeDeactivatedTemplate(tableRows);
                sendMail(subjects.PAYMENT_NOTIFICATION, html);
                return;
            }
            console.info('No hay suscripciones para notificar');
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    AffiliatesSuscriptionsService
}