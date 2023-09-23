const { BaseService } = require('./base.service');
const { sendMail } = require('../utils/mailer');
const { sendWhatsAppMessage } = require('../utils/twilio/sender.util');
const { subjects } = require('../constants/subjects.constant');
const config = require('../config/config');
const AffiliatesSuscriptionModel = require('../models/affiliatesSuscription.model');
const { deactivateSuscriptionTemplate, subscriptionsThatWillBeDeactivatedTemplate } = require('../templates/email');
const { deactivateSuscriptionWppTemplate } = require('../templates/wpp');
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
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 31) {
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

                // send message to wpp
                suscriptionsToDeactivate.forEach(suscription => {
                    const affiliateName = suscription.idAfiliado.nombreCompleto;
                    const sede = suscription.idAfiliado.sede;
                    const body = deactivateSuscriptionWppTemplate({ affiliateName, sede });
                    sendWhatsAppMessage("3212953646", body)
                        .then(message => console.info(message.sid))
                        .catch(error => console.error(error));
                });
                return;
            }
            console.info('No hay suscripciones para desactivar');
        } catch (error) {
            console.error(error);
        }
    }

    async subscriptionsThatWillBeDeactivated() {
        // buscamos todas las suscripciones que esten activas y que les falte 3 dias para el pago y enviamos email
        try {
            const today = new Date();
            const suscriptions = await AffiliatesSuscriptionModel.find({ activo: true })
                .populate('idAfiliado');

            const suscriptionsToNotify = [];
            suscriptions.forEach(suscription => {
                const date = new Date(suscription.fechaDePago);
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 28) {
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