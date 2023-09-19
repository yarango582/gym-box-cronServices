const { BaseService } = require('./base.service');
const AffiliatesSuscriptionModel = require('../models/affiliatesSuscription.model');
const AffiliatesModel = require('../models/affiliates.model');
const { sendMail } = require('../utils/mailer');
const { subjects } = require('../constants/subjects.constant');

class AffiliatesSuscriptionsService extends BaseService {

    constructor() {
        super("AffiliatesSuscriptionsService", '*/1 * * * *');
    }

    async execute() {
        console.log(`Executing ${this.name} cron service`);
        await this.deactivateSuscription();
        await this.subscriptionsThatWillBeDeactivated();
    }

    async deactivateSuscription() {
        // buscamos todas las suscripciones activas que ya pasaron 30 dias desde la fecha de pago
        // y  las desactivamos
        try {
            const today = new Date();
            const suscriptions = await AffiliatesSuscriptionModel.find({ status: 'active' });
            const suscriptionsToDeactivate = [];
            suscriptions.forEach(suscription => {
                const date = new Date(suscription.date);
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 30) {
                    suscription.activo = false;
                    suscription.save();
                    suscriptionsToDeactivate.push(suscription);
                }
            });
            if(suscriptionsToDeactivate.length > 0) {
                const affiliates = await AffiliatesModel.find();
                const tableRows = suscriptionsToDeactivate.map(suscription => {
                    const affiliate = affiliates.find(affiliate => affiliate._id === suscription.affiliateId);
                    return `
                        <tr>
                            <td>${affiliate.nombreCompleto}</td>
                            <td>${affiliate.numeroDocumento}</td>
                            <td>${affiliate.celular}</td>
                            <td>${suscription.fechaDePago}</td>
                        </tr>
                    `;
                }).join('');
                const html = `
                    <h1>Notificación de pago</h1>
                    <p>Estimado/a:</p>
                    <p>Le informamos que las siguientes suscripciones han sido desactivadas por falta de pago.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre completo</th>
                                <th>Número de documento</th>
                                <th>Celular</th>
                                <th>Fecha de pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <p>Saludos cordiales,</p>
                    <p>Equipo de soporte de la plataforma de afiliados.</p>
                    <p>GYM BOX 360</p>
                `;
                sendMail(subjects.DEACTIVE_SUSCRIPTION, html);
                return;
            }
            console.log('No hay suscripciones para desactivar');
        } catch (error) {
            console.error(error);
        }
    }

    async subscriptionsThatWillBeDeactivated() {
        // buscamos todas las suscripciones que esten activas y que les falte 3 dias para el pago y enviamos email
        try {
            const today = new Date();
            const suscriptions = await AffiliatesSuscriptionModel.find({ activo: true });
            const suscriptionsToNotify = [];
            suscriptions.forEach(suscription => {
                const date = new Date(suscription.date);
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 27) {
                    suscriptionsToNotify.push(suscription);
                }
            });
            if (suscriptionsToNotify.length > 0) {
                const affiliates = await AffiliatesModel.find();
                const tableRows = suscriptionsToNotify.map(suscription => {
                    const affiliate = affiliates.find(affiliate => affiliate._id === suscription.affiliateId);
                    return `
                        <tr>
                            <td>${affiliate.nombreCompleto}</td>
                            <td>${affiliate.numeroDocumento}</td>
                            <td>${affiliate.celular}</td>
                            <td>${suscription.fechaDePago}</td>
                        </tr>
                    `;
                }).join('');
                const html = `
                    <h1>Notificación de pago</h1>
                    <p>Estimado/a:</p>
                    <p>Le informamos que las siguientes suscripciones vencerán en 3 días. Por favor, realice el pago correspondiente para continuar con el servicio.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre completo</th>
                                <th>Número de documento</th>
                                <th>Celular</th>
                                <th>Fecha de pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <p>Saludos cordiales,</p>
                    <p>Equipo de soporte de la plataforma de afiliados.</p>
                    <p>GYM BOX 360</p>
                `;
                sendMail(subjects.PAYMENT_NOTIFICATION, html);
                return;
            }
            console.log('No hay suscripciones para notificar');
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    AffiliatesSuscriptionsService
}