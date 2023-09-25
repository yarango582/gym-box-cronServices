
const deactivateSuscriptionWppTemplate = ({ affiliateName, sede }) => {

    let paymentDetails = '';
    const paymentJamundi = `Bancolombia 71600024153 Ahorros Nequi-3212953646 enviar soporte al 3158862611`;
    const paymentOtherSedes = `Bancolombia 80875833514 Ahorros Nequi-3183035286`;

    if(sede === 'jamundi') {
        paymentDetails = paymentJamundi;
    } else {
        paymentDetails = paymentOtherSedes;
    }

    const body =`Hola! ${affiliateName} GYMBOX360-${sede} Recuerda tu pago a: ${paymentDetails}`;
    return body;
}

module.exports = deactivateSuscriptionWppTemplate;