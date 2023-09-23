

const subscriptionsThatWillBeDeactivatedTemplate = (tableRows) => {
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
                        <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Fecha de último pago</th>
                        <th style="background-color: #001529; color: #fff; font-size: 18px; padding: 10px; text-align: left;">Sede</th>
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
    return html;
}

module.exports = subscriptionsThatWillBeDeactivatedTemplate;