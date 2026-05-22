for (let [id, trade] of activeContracts) {
        const li = document.createElement('li');
        li.textContent = ID: ${id} | $${trade.amount.toFixed(2)} | Activo;
        activeTradesList.appendChild(li);
    }
}

function initBotFromUI() {
    botState.metaDiaria = parseFloat(document.getElementById('botMetaDiaria').value);
    botState.stopLoss = parseFloat(document.getElementById('botStopLoss').value);
    botState.martingale = parseFloat(document.getElementById('botMartingale').value);
    botState.stakeInicial = parseFloat(document.getElementById('botStakeInicial').value);
    botState.stakeMaximo = parseFloat(document.getElementById('botStakeMaximo').value);
    botState.digitoObjetivo = parseInt(document.getElementById('botDigitoObjetivo').value);
    botState.currentStake = botState.stakeInicial;
    botState.indicador = 0;
    botState.ativo = 2;
    botState.ativoDesligado = botState.digitoObjetivo;
    botState.dailyProfit = 0;
    addBotLog('Bot configurado', 'success');
}

function processBotTick(digit) {
    if (digit === botState.ativoDesligado) {
        botState.indicador++;
    } else {
        botState.indicador = 0;
    }
    
    if (botState.totalProfit <= -botState.stopLoss) {
        addBotLog(`🛑 STOP LOSS alcanzado (${botState.totalProfit})`, 'error');
        stopBot();
        return;
    }
    
    if (botState.dailyProfit >= botState.metaDiaria) {
        addBotLog(`🎯 META DIARIA alcanzada (${botState.dailyProfit})`, 'success');
        stopBot();
        return;
    }
    
    if (botState.indicador >= botState.ativo && botRunning) {
        const amount = Math.min(botState.currentStake, botState.stakeMaximo);
        addBotLog(`🤖 Bot: Dígito actual ${digit} | Apuesta $${amount} a UNDER ${botState.digitoObjetivo}`, 'info');
        
        const proposal = {
            proposal: 1,
            amount: amount,
            basis: 'stake',
            contract_type: 'DIGITUNDER',
            currency: 'USD',
            duration: 1,
            duration_unit: 't',
            symbol: currentSymbol,
            barrier: botState.digitoObjetivo.toString()
        };
        ws.send(JSON.stringify(proposal));
        botState.indicador = 0;
    }
}

function startBot() {
    if (!isConnected) {
        alert('Primero conecta tu cuenta de Deriv');
        return;
    }
    initBotFromUI();
    botRunning = true;
    botEstadoSpan.textContent = '🏃 Activo';
    toggleBotBtn.textContent = '⏸️ Detener Bot';
    toggleBotBtn.classList.add('running');
    addBotLog('🤖 Bot iniciado - Estrategia IA Dígit V2', 'success');
}

function stopBot() {
    botRunning = false;
    botEstadoSpan.textContent = '⏸️ Detenido';
    toggleBotBtn.textContent = '▶️ Iniciar Bot';
    toggleBotBtn.classList.remove('running');
    addBotLog('⏹️ Bot detenido', 'info');
}

toggleBotBtn.onclick = () => {
    if (botRunning) stopBot();
    else startBot();
};

connectBtn.onclick = connectDeriv;
symbolSelect.onchange = (e) => changeSymbol(e.target.value);
refreshChartBtn.onclick = () => { priceHistory = []; if (chart) chart.destroy(); initChart(); };

initChart();
addBotLog('🚀 Plataforma lista. Conecta tu token y configura el bot.', 'info');
