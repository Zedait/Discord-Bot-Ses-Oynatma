const { execSync } = require('child_process');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');

try {
    execSync('npm install sodium-native libsodium-wrappers tweetnacl');
    console.log('Gerekli şifreleme paketleri yüklendi.');
} catch (error) {
    console.error('Şifreleme paketlerini yüklerken bir hata oluştu:', error.message);
}

const TOKEN = 'BOT TOKEN';
const VOICE_CHANNEL_ID = 'SES KANAL ID';
const MP3_FILE_PATH = path.join(__dirname, 'ses/dosyası/dizini.mp3');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ],
});

let connection;

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    const voiceChannel = client.channels.cache.get(VOICE_CHANNEL_ID);
    if (voiceChannel) {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Bot ses kanalına bağlandı ve hazır!');
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('Bot ses kanalından ayrıldı.');
        });
    } else {
        console.error('Ses kanalı bulunamadı.');
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channelId === VOICE_CHANNEL_ID && oldState.channelId !== VOICE_CHANNEL_ID && newState.member.id !== client.user.id) {
        const player = createAudioPlayer();
        const resource = createAudioResource(MP3_FILE_PATH);

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Ses dosyası oynatılıyor!');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Ses dosyası bitti.');
        });

        player.on('error', error => {
            console.error('Ses oynatılırken hata oluştu:', error);
        });
    }
});

client.login(TOKEN);
