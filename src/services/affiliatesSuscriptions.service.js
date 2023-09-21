const { BaseService } = require('./base.service');
const { sendMail } = require('../utils/mailer');
const { subjects } = require('../constants/subjects.constant');
const config = require('../config/config');
const AffiliatesSuscriptionModel = require('../models/affiliatesSuscription.model');

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
                            <td>${suscription.fechaDePago}</td>
                        </tr>
                    `;
                }).join('');
                const html = `
                <div style="background-color: #f5f5f5; padding: 20px;">
                    <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #001529; font-size: 36px; margin-bottom: 20px;">Notificación de pago</h1>
                        <p style="font-size: 18px; margin-bottom: 20px;">Estimado/a:</p>
                        <p style="font-size: 18px; margin-bottom: 20px;">Le informamos que las siguientes suscripciones han sido desactivadas por falta de pago.</p>
                        <table style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Nombre completo</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Número de documento</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Celular</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Fecha de último pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                        <p style="font-size: 18px; margin-top: 20px;">Saludos cordiales,</p>
                        <p style="font-size: 18px;">Equipo de soporte de la plataforma de afiliados.</p>
                        <p style="font-size: 18px;">GYM BOX 360</p>
                    </div>
                </div>
            `;
                sendMail(subjects.DEACTIVE_SUSCRIPTION, html);
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
                            <td>${suscription.fechaDePago}</td>
                        </tr>
                    `;
                }).join('');
                const html = `
                <div style="background-color: #f5f5f5; padding: 20px;">
                    <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #001529; font-size: 36px; margin-bottom: 20px;">Notificación de pago</h1>
                        <p style="font-size: 18px; margin-bottom: 20px;">Estimado/a:</p>
                        <p style="font-size: 18px; margin-bottom: 20px;">Le informamos que las siguientes suscripciones vencerán en 3 días. Por favor, realice el pago correspondiente para continuar con el servicio.</p>
                        <table style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Nombre completo</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Número de documento</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Celular</th>
                                    <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Fecha de pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                        <p style="font-size: 18px; margin-top: 20px;">Saludos cordiales,</p>
                        <p style="font-size: 18px;">Equipo de soporte de la plataforma de afiliados.</p>
                        <p style="font-size: 18px;">GYM BOX 360</p>
                    </div>
                </div>
            `;
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