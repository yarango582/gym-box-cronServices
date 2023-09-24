
const deactivateSuscriptionWppTemplate = ({ affiliateName, sede }) => {

    const paymentJamundi = `
    adjuntamos los medios de pago disponibles:
    Bancolombia # 71600024153 Cuenta ahorros
    Lina Marcela Garzon Muñoz - 1143970594
    Nequi -3212953646
    Adjuntar comprobante de pago al numero: +57 3158862611
    `;
    const paymentOtherSedes = `
    adjuntamos los medios de pago disponibles:
    Bancolombia # 80875833514 Cuenta ahorros
    Jhonatan Andrés López - 1143949746
    Nequi - 3183035286
    `;

    const body =`
    Hola! ${affiliateName}, te saludamos de GYMBOX360 ${sede}, queremos informarte que tu suscripcion esta vencida.

    recuerda que:
    1. tienes 3 dias antes de perder todo descuento individual y/o grupal que tengas.
    2. si deseas cancelar debes avisar con minimo 3 dias de anticipación

    ${sede === 'jamundi' ? paymentJamundi : paymentOtherSedes }

    Trabaja en tu debilidad hasta que se convierta en tu fortaleza. - Knute Rockne
    GYMBOX360 💪
    `;
    return body;
}

module.exports = deactivateSuscriptionWppTemplate;