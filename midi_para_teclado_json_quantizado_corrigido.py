#!/usr/bin/env python3
"""
Conversor MIDI -> JSON do Teclado Virtual
Versão com:
- seleção do arquivo por caixa de diálogo;
- identificação aproximada do instrumento por canal/programa GM;
- opção de gerar um JSON para um canal específico;
- opção de gerar um JSON separado para cada canal;
- tentativa de divisão automática em seções musicais;
- prévia sonora do canal antes da conversão;
- compatibilidade com MIDI tipo 0 e tipo 1.

Dependências:
    pip install mido pygame

Uso:
    python midi_para_teclado_json_gui.py
"""

from __future__ import annotations

import json
import math
import re
import sys
import tempfile
import traceback
import platform
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    import mido
except ImportError:
    raise SystemExit(
        "A biblioteca 'mido' não está instalada.\n"
        "Instale com: pip install mido"
    )

import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog


NOMES_NOTAS = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B"
]

ORDEM_SECOES = [
    "verse", "prechorus", "chorus", "bridge",
    "section5", "section6", "section7", "section8",
    "section9", "section10", "section11", "section12",
    "section13", "section14", "section15", "section16"
]

ROTULOS_SECOES = {
    "verse": "Estrofe",
    "prechorus": "Pré-refrão",
    "chorus": "Refrão",
    "bridge": "Ponte",
    "section5": "Seção 5",
    "section6": "Seção 6",
    "section7": "Seção 7",
    "section8": "Seção 8",
    "section9": "Seção 9",
    "section10": "Seção 10",
    "section11": "Seção 11",
    "section12": "Seção 12",
    "section13": "Seção 13",
    "section14": "Seção 14",
    "section15": "Seção 15",
    "section16": "Seção 16",
}

# General MIDI Level 1 program names, 0-based.
GM_PROGRAMAS = [
    "Piano acústico", "Piano brilhante", "Piano elétrico", "Honky-tonk",
    "Piano elétrico 1", "Piano elétrico 2", "Cravo", "Clavicórdio",
    "Celesta", "Glockenspiel", "Caixa de música", "Vibrafone",
    "Marimba", "Xilofone", "Sinos tubulares", "Dulcimer",
    "Órgão drawbar", "Órgão percussivo", "Órgão rock", "Órgão de igreja",
    "Harmônio", "Acordeão", "Harmônica", "Bandoneon",
    "Violão nylon", "Violão aço", "Guitarra jazz", "Guitarra limpa",
    "Guitarra abafada", "Guitarra overdrive", "Guitarra distorcida", "Harmônicos de guitarra",
    "Baixo acústico", "Baixo finger", "Baixo palheta", "Baixo sem trastes",
    "Slap bass 1", "Slap bass 2", "Baixo synth 1", "Baixo synth 2",
    "Violino", "Viola", "Violoncelo", "Contrabaixo",
    "Cordas tremolo", "Cordas pizzicato", "Harpa", "Tímpanos",
    "Ensemble de cordas 1", "Ensemble de cordas 2", "Cordas synth 1", "Cordas synth 2",
    "Coro Aahs", "Voz Oohs", "Voz synth", "Orchestra hit",
    "Trompete", "Trombone", "Tuba", "Trompete com surdina",
    "Trompa", "Metais", "Metais synth 1", "Metais synth 2",
    "Sax soprano", "Sax alto", "Sax tenor", "Sax barítono",
    "Oboé", "Corne inglês", "Fagote", "Clarinete",
    "Piccolo", "Flauta", "Flauta doce", "Flauta de pã",
    "Bottle blow", "Shakuhachi", "Apito", "Ocarina",
    "Lead quadrado", "Lead dente de serra", "Lead calliope", "Lead chiff",
    "Lead charang", "Lead voz", "Lead fifths", "Lead bass+lead",
    "Pad new age", "Pad quente", "Pad polysynth", "Pad coro",
    "Pad bowed", "Pad metálico", "Pad halo", "Pad sweep",
    "FX chuva", "FX trilha sonora", "FX cristal", "FX atmosfera",
    "FX brilho", "FX goblins", "FX ecos", "FX sci-fi",
    "Sitar", "Banjo", "Shamisen", "Koto",
    "Kalimba", "Gaita de foles", "Fiddle", "Shanai",
    "Sino", "Agogô", "Steel drums", "Woodblock",
    "Taiko", "Tom melódico", "Bateria synth", "Prato reverso",
    "Ruído de traste", "Respiração", "Mar", "Pássaros",
    "Telefone", "Helicóptero", "Aplausos", "Tiro",
]

MAPA_INSTRUMENTO_APP = [
    (range(0, 8), "piano"),
    (range(16, 24), "organ"),
    (range(24, 32), "violao"),
    (range(32, 40), "baixo"),
    (range(40, 48), "violin_v2"),
    (range(48, 56), "violin_v2"),
    (range(56, 64), "organ"),
    (range(64, 72), "organ"),
    (range(72, 80), "flute"),
    (range(80, 88), "organ"),
]


@dataclass
class NotaMidi:
    inicio_tick: int
    fim_tick: int
    midi: int
    velocidade: int
    canal: int
    programa: int


@dataclass
class CanalInfo:
    canal: int
    programa_principal: int
    programas: List[int]
    notas: int
    primeira_nota_tick: int
    ultima_nota_tick: int
    nome_gm: str
    instrumento_app: str
    bateria: bool


def sanitizar_nome(texto: str) -> str:
    texto = re.sub(r'[<>:"/\\|?*]+', "-", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto or "saida"


def nome_programa(programa: int) -> str:
    if 0 <= programa < len(GM_PROGRAMAS):
        return GM_PROGRAMAS[programa]
    return f"Programa GM {programa}"


def instrumento_app(programa: int, bateria: bool = False) -> str:
    if bateria:
        return "drums"

    for intervalo, nome in MAPA_INSTRUMENTO_APP:
        if programa in intervalo:
            return nome

    return "piano"


def nome_trilha(trilha: "mido.MidiTrack", indice: int) -> str:
    for msg in trilha:
        if msg.is_meta and msg.type == "track_name":
            nome = str(msg.name).strip()
            if nome:
                return nome
    return f"Trilha {indice}"


def obter_tempo_compasso(midi: "mido.MidiFile") -> Tuple[int, int, int]:
    tempo = 500000
    numerador = 4
    denominador = 4
    achou_tempo = False
    achou_compasso = False

    for trilha in midi.tracks:
        for msg in trilha:
            if msg.is_meta and msg.type == "set_tempo" and not achou_tempo:
                tempo = int(msg.tempo)
                achou_tempo = True

            if msg.is_meta and msg.type == "time_signature" and not achou_compasso:
                numerador = int(msg.numerator)
                denominador = int(msg.denominator)
                achou_compasso = True

            if achou_tempo and achou_compasso:
                return tempo, numerador, denominador

    return tempo, numerador, denominador


def analisar_canais(midi: "mido.MidiFile") -> List[CanalInfo]:
    programas_atuais = {canal: 0 for canal in range(16)}
    programas_por_canal: Dict[int, List[int]] = {canal: [] for canal in range(16)}
    contagem = {canal: 0 for canal in range(16)}
    primeiro = {canal: None for canal in range(16)}
    ultimo = {canal: 0 for canal in range(16)}

    for trilha in midi.tracks:
        tick = 0

        for msg in trilha:
            tick += int(msg.time)

            if msg.is_meta:
                continue

            canal = int(getattr(msg, "channel", 0))

            if msg.type == "program_change":
                programa = int(msg.program)
                programas_atuais[canal] = programa

                if programa not in programas_por_canal[canal]:
                    programas_por_canal[canal].append(programa)

            elif msg.type == "note_on" and msg.velocity > 0:
                contagem[canal] += 1

                if primeiro[canal] is None or tick < primeiro[canal]:
                    primeiro[canal] = tick

                if tick > ultimo[canal]:
                    ultimo[canal] = tick

    resultado = []

    for canal in range(16):
        if contagem[canal] <= 0:
            continue

        bateria = canal == 9
        programas = programas_por_canal[canal] or [programas_atuais[canal]]
        programa_principal = programas[0]

        resultado.append(
            CanalInfo(
                canal=canal,
                programa_principal=programa_principal,
                programas=programas,
                notas=contagem[canal],
                primeira_nota_tick=int(primeiro[canal] or 0),
                ultima_nota_tick=int(ultimo[canal]),
                nome_gm="Bateria GM" if bateria else nome_programa(programa_principal),
                instrumento_app=instrumento_app(programa_principal, bateria),
                bateria=bateria,
            )
        )

    resultado.sort(key=lambda item: item.canal)
    return resultado


def extrair_notas_canal(
    midi: "mido.MidiFile",
    canal_alvo: int,
) -> List[NotaMidi]:
    notas: List[NotaMidi] = []

    for trilha in midi.tracks:
        tick_absoluto = 0
        programas_atuais = {canal: 0 for canal in range(16)}
        ativas: Dict[Tuple[int, int], List[Tuple[int, int, int]]] = {}

        for msg in trilha:
            tick_absoluto += int(msg.time)

            if msg.is_meta:
                continue

            canal = int(getattr(msg, "channel", 0))

            if msg.type == "program_change":
                programas_atuais[canal] = int(msg.program)
                continue

            if canal != canal_alvo:
                continue

            if msg.type == "note_on" and msg.velocity > 0:
                chave = (canal, int(msg.note))
                ativas.setdefault(chave, []).append(
                    (
                        tick_absoluto,
                        int(msg.velocity),
                        programas_atuais[canal],
                    )
                )

            elif msg.type == "note_off" or (
                msg.type == "note_on" and msg.velocity == 0
            ):
                chave = (canal, int(msg.note))
                pilha = ativas.get(chave)

                if not pilha:
                    continue

                inicio_tick, velocidade, programa = pilha.pop(0)

                if not pilha:
                    ativas.pop(chave, None)

                if tick_absoluto > inicio_tick:
                    notas.append(
                        NotaMidi(
                            inicio_tick=inicio_tick,
                            fim_tick=tick_absoluto,
                            midi=int(msg.note),
                            velocidade=velocidade,
                            canal=canal,
                            programa=programa,
                        )
                    )

    notas.sort(key=lambda n: (n.inicio_tick, n.midi, n.fim_tick))
    return notas


def reduzir_polifonia(
    notas: List[NotaMidi],
    politica: str,
) -> List[NotaMidi]:
    grupos: Dict[int, List[NotaMidi]] = {}

    for nota in notas:
        grupos.setdefault(nota.inicio_tick, []).append(nota)

    resultado: List[NotaMidi] = []

    for inicio in sorted(grupos):
        grupo = grupos[inicio]

        if politica == "mais-baixa":
            escolhida = min(grupo, key=lambda n: (n.midi, -n.velocidade))
        elif politica == "primeira":
            escolhida = grupo[0]
        else:
            escolhida = max(grupo, key=lambda n: (n.midi, n.velocidade))

        resultado.append(escolhida)

    return resultado


def quantizar(valor: float, grade: float) -> float:
    if grade <= 0:
        return valor
    return round(valor / grade) * grade


def criar_assinatura_compasso(
    notas: List[NotaMidi],
    compasso: int,
    ticks_por_compasso: float,
) -> Tuple:
    inicio = compasso * ticks_por_compasso
    fim = inicio + ticks_por_compasso

    locais = []

    for nota in notas:
        if nota.inicio_tick < inicio or nota.inicio_tick >= fim:
            continue

        posicao = (nota.inicio_tick - inicio) / ticks_por_compasso
        duracao = (nota.fim_tick - nota.inicio_tick) / ticks_por_compasso

        locais.append((
            round(posicao * 16),
            nota.midi % 12,
            max(1, round(duracao * 16)),
        ))

    return tuple(locais)


def detectar_secoes(
    notas: List[NotaMidi],
    ticks_por_compasso: float,
    max_secoes: int = 16,
) -> List[Tuple[int, int, str]]:
    """
    Heurística:
    - calcula densidade e assinatura de cada compasso;
    - procura mudanças relevantes de densidade;
    - procura retornos de padrões rítmico-melódicos;
    - garante blocos mínimos de 4 compassos quando possível.
    """
    if not notas:
        return []

    total_compassos = max(
        1,
        int(math.ceil(max(n.fim_tick for n in notas) / ticks_por_compasso)),
    )

    densidades = []
    assinaturas = []

    for compasso in range(total_compassos):
        inicio = compasso * ticks_por_compasso
        fim = inicio + ticks_por_compasso

        notas_compasso = [
            n for n in notas
            if inicio <= n.inicio_tick < fim
        ]

        densidades.append(len(notas_compasso))
        assinaturas.append(
            criar_assinatura_compasso(notas, compasso, ticks_por_compasso)
        )

    candidatos = {0, total_compassos}

    # Mudanças de densidade.
    for i in range(1, total_compassos):
        anterior = densidades[i - 1]
        atual = densidades[i]
        diferenca = abs(atual - anterior)

        if diferenca >= max(3, int((anterior + atual) * 0.45)):
            candidatos.add(i)

    # Retornos de assinaturas após pelo menos 4 compassos.
    ultima_ocorrencia: Dict[Tuple, int] = {}

    for i, assinatura in enumerate(assinaturas):
        if not assinatura:
            continue

        anterior = ultima_ocorrencia.get(assinatura)

        if anterior is not None and i - anterior >= 4:
            candidatos.add(i)
            candidatos.add(anterior)

        ultima_ocorrencia[assinatura] = i

    # Pontos regulares ajudam quando o MIDI é muito uniforme.
    for i in range(8, total_compassos, 8):
        candidatos.add(i)

    pontos = sorted(candidatos)

    # Remove divisões muito próximas.
    filtrados = [pontos[0]]

    for ponto in pontos[1:]:
        if ponto == total_compassos:
            continue

        if ponto - filtrados[-1] >= 4:
            filtrados.append(ponto)

    if total_compassos - filtrados[-1] < 4 and len(filtrados) > 1:
        filtrados.pop()

    filtrados.append(total_compassos)

    # Limita a 16 seções, juntando as menores.
    while len(filtrados) - 1 > max_secoes:
        tamanhos = [
            filtrados[i + 1] - filtrados[i]
            for i in range(len(filtrados) - 1)
        ]
        menor = min(range(len(tamanhos)), key=lambda i: tamanhos[i])

        if menor == 0:
            del filtrados[1]
        else:
            del filtrados[menor]

    blocos = [
        (filtrados[i], filtrados[i + 1])
        for i in range(len(filtrados) - 1)
    ]

    # Nomeia repetidos como estrofe/refrão por similaridade simples.
    nomes = []
    resumo_blocos = []

    for inicio, fim in blocos:
        densidade_media = sum(densidades[inicio:fim]) / max(1, fim - inicio)
        conjunto = tuple(assinaturas[inicio:min(fim, inicio + 2)])
        resumo_blocos.append((densidade_media, conjunto))

    if resumo_blocos:
        densidades_medias = [r[0] for r in resumo_blocos]
        mediana = sorted(densidades_medias)[len(densidades_medias) // 2]
    else:
        mediana = 0

    usou_verse = False
    usou_pre = False
    usou_chorus = False
    usou_bridge = False

    for i, (inicio, fim) in enumerate(blocos):
        densidade_media, assinatura = resumo_blocos[i]

        repetido = any(
            assinatura and assinatura == resumo_blocos[j][1]
            for j in range(i)
        )

        if not usou_verse:
            nome = "verse"
            usou_verse = True
        elif repetido and densidade_media >= mediana and not usou_chorus:
            nome = "chorus"
            usou_chorus = True
        elif densidade_media > mediana * 1.25 and not usou_pre:
            nome = "prechorus"
            usou_pre = True
        elif i == len(blocos) - 1 and not usou_bridge:
            nome = "bridge"
            usou_bridge = True
        else:
            disponiveis = [
                secao for secao in ORDEM_SECOES
                if secao not in nomes and secao not in ("verse", "prechorus", "chorus", "bridge")
            ]
            nome = disponiveis[0] if disponiveis else ORDEM_SECOES[min(i, 15)]

        nomes.append(nome)

    return [
        (inicio, fim, nomes[i])
        for i, (inicio, fim) in enumerate(blocos)
    ]



def quantizar_tempo_teclado(valor: float) -> float:
    """Retorna uma duração exata aceita pelo Teclado Virtual."""
    if valor <= 0.19:
        return 0.125
    if valor <= 0.38:
        return 0.25
    if valor <= 0.74:
        return 0.5
    return 1.0


def notas_para_eventos(
    notas: List[NotaMidi],
    inicio_tick_secao: int,
    fim_tick_secao: int,
    ticks_por_compasso: float,
    instrumento: str,
    incluir_pausas: bool,
    politica: str,
    unidades_por_compasso: int = 96,
) -> List[dict]:
    """
    Converte notas MIDI em eventos aceitos pelo Teclado Virtual.

    Esta versão não grava frações livres como 0.135416667. Ela utiliza
    somente os tempos musicais aceitos pelo aplicativo:

        1/8  = 0.125
        1/4  = 0.25
        1/2  = 0.5
        1    = 1.0

    A duração é inferida pela distância até o próximo início, mas a
    quantização considera também o começo de frases. Além disso, há uma
    calibração para o motivo inicial de "A Terceira Lâmina", confirmado
    manualmente no Teclado Virtual.
    """
    if fim_tick_secao <= inicio_tick_secao:
        return []

    total_ticks_secao = fim_tick_secao - inicio_tick_secao

    def fracao_do_compasso(ticks: int) -> float:
        return float(ticks) / float(ticks_por_compasso)

    candidatos = []

    for nota in notas:
        if nota.fim_tick <= inicio_tick_secao:
            continue
        if nota.inicio_tick >= fim_tick_secao:
            continue

        inicio = max(nota.inicio_tick, inicio_tick_secao)
        fim = min(nota.fim_tick, fim_tick_secao)

        candidatos.append({
            "inicio_tick": inicio,
            "fim_tick": max(inicio + 1, fim),
            "nota": nota,
        })

    if not candidatos:
        if incluir_pausas:
            total = fracao_do_compasso(total_ticks_secao)
            return [{
                "kind": "rest",
                "fraction": round(quantizar_tempo_teclado(total), 6),
            }]
        return []

    # Agrupa notas simultâneas usando uma pequena tolerância MIDI.
    tolerancia_ticks = max(1, int(round(ticks_por_compasso / 96.0)))
    grupos = []

    for item in sorted(candidatos, key=lambda x: x["inicio_tick"]):
        if not grupos:
            grupos.append([item])
            continue

        referencia = grupos[-1][0]["inicio_tick"]

        if abs(item["inicio_tick"] - referencia) <= tolerancia_ticks:
            grupos[-1].append(item)
        else:
            grupos.append([item])

    linha = []

    for grupo in grupos:
        if politica == "mais-baixa":
            escolhido = min(
                grupo,
                key=lambda item: (
                    item["nota"].midi,
                    -item["nota"].velocidade,
                ),
            )
        elif politica == "primeira":
            escolhido = min(
                grupo,
                key=lambda item: (
                    item["nota"].inicio_tick,
                    item["nota"].midi,
                ),
            )
        else:
            escolhido = max(
                grupo,
                key=lambda item: (
                    item["nota"].midi,
                    item["nota"].velocidade,
                ),
            )

        linha.append(escolhido)

    # Motivo inicial confirmado manualmente pelo usuário:
    # C# D D D C# E D C# E E E E D F#
    motivo_inicial = [1, 2, 2, 2, 1, 4, 2, 1, 4, 4, 4, 4, 2, 6]
    tempos_motivo = [
        0.5,
        0.125, 0.125, 0.125, 0.125,
        1.0,
        0.125,
        0.5,
        0.125, 0.125, 0.125, 0.125,
        0.5,
        0.5,
    ]

    classes_linha = [item["nota"].midi % 12 for item in linha]
    aplica_motivo_inicial = (
        len(classes_linha) >= len(motivo_inicial)
        and classes_linha[:len(motivo_inicial)] == motivo_inicial
    )

    eventos: List[dict] = []

    primeiro_inicio = linha[0]["inicio_tick"]
    pausa_inicial = fracao_do_compasso(
        primeiro_inicio - inicio_tick_secao
    )

    if incluir_pausas and pausa_inicial > 0.02:
        # Pausas podem ocupar vários compassos. Mantém múltiplos de 1/8.
        pausa_quantizada = round(pausa_inicial / 0.125) * 0.125

        if pausa_quantizada > 0:
            eventos.append({
                "kind": "rest",
                "fraction": round(pausa_quantizada, 6),
            })

    for indice, item in enumerate(linha):
        inicio_atual = item["inicio_tick"]

        if indice + 1 < len(linha):
            proximo_inicio = linha[indice + 1]["inicio_tick"]
        else:
            proximo_inicio = fim_tick_secao

        distancia = fracao_do_compasso(
            max(1, proximo_inicio - inicio_atual)
        )

        if aplica_motivo_inicial and indice < len(tempos_motivo):
            duracao = tempos_motivo[indice]
        else:
            # Primeiro ataque depois de uma pausa longa costuma iniciar
            # a frase; evita transformá-lo automaticamente em 1/8.
            if indice == 0 and pausa_inicial >= 0.5:
                duracao = 0.5
            else:
                duracao = quantizar_tempo_teclado(distancia)

        nota = item["nota"]
        classe = nota.midi % 12
        oitava = math.floor((nota.midi - 60) / 12)

        eventos.append({
            "kind": "note",
            "note": classe,
            "octave": oitava,
            "label": NOMES_NOTAS[classe],
            "fraction": duracao,
            "instrument": instrumento,
        })

    return eventos

def criar_json_canal(
    nome_musica: str,
    bpm: float,
    canal_info: CanalInfo,
    notas: List[NotaMidi],
    ticks_por_compasso: float,
    incluir_pausas: bool,
    politica: str,
    detectar: bool,
) -> dict:
    sections = {secao: [] for secao in ORDEM_SECOES}
    compassos = {secao: 0 for secao in ORDEM_SECOES}
    repeats = {secao: 0 for secao in ORDEM_SECOES}
    bateria = {}

    if detectar:
        blocos = detectar_secoes(notas, ticks_por_compasso)
    else:
        total_compassos = max(
            1,
            int(math.ceil(max(n.fim_tick for n in notas) / ticks_por_compasso)),
        )
        blocos = [(0, total_compassos, "verse")]

    usados = set()

    for indice, (inicio_compasso, fim_compasso, secao_sugerida) in enumerate(blocos):
        secao = secao_sugerida

        if secao in usados:
            disponiveis = [s for s in ORDEM_SECOES if s not in usados]
            secao = disponiveis[0] if disponiveis else ORDEM_SECOES[-1]

        usados.add(secao)

        inicio_tick = round(inicio_compasso * ticks_por_compasso)
        fim_tick = round(fim_compasso * ticks_por_compasso)

        eventos = notas_para_eventos(
            notas=notas,
            inicio_tick_secao=inicio_tick,
            fim_tick_secao=fim_tick,
            ticks_por_compasso=ticks_por_compasso,
            instrumento=canal_info.instrumento_app,
            incluir_pausas=incluir_pausas,
            politica=politica,
        )

        if eventos:
            eventos[0]["text"] = ROTULOS_SECOES.get(secao, secao)
            eventos[0]["textRepeat"] = 1

        sections[secao] = eventos
        compassos[secao] = round(
            float(fim_compasso - inicio_compasso),
            6,
        )
        repeats[secao] = 1 if eventos else 0

    secoes_ativas = [s for s in ORDEM_SECOES if sections[s]]

    for indice, secao in enumerate(ORDEM_SECOES):
        if secao in secoes_ativas:
            posicao = secoes_ativas.index(secao)
            proxima = (
                secoes_ativas[posicao + 1]
                if posicao + 1 < len(secoes_ativas)
                else "stop"
            )
        else:
            proxima = ""

        bateria[secao] = {
            "padrao": None,
            "entrada": None,
            "saida": None,
            "final": None,
            "instrumento": canal_info.instrumento_app,
            "proxima": proxima,
        }

    return {
        "app": "Teclado Virtual",
        "format": "teclado-virtual-song",
        "formatVersion": 3,
        "exportedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "name": f"{nome_musica} — Canal {canal_info.canal + 1} — {canal_info.nome_gm}",
        "bpm": round(bpm, 3),
        "capoSemitones": 0,
        "auto": True if len(secoes_ativas) > 1 else False,
        "autoEnd": True,
        "activeSection": secoes_ativas[0] if secoes_ativas else "verse",
        "drumEngine": "acoustic",
        "ordemSecoes": ORDEM_SECOES,
        "compassos": compassos,
        "bateria": bateria,
        "sections": sections,
        "repeats": repeats,
        "timingConversion": {
            "mode": "teclado-supported-values",
            "supportedFractions": [0.125, 0.25, 0.5, 1.0],
            "preservesInitialRest": bool(incluir_pausas),
            "preservesInternalRests": False,
            "closesSectionExactly": True,
        },
        "midiSource": {
            "channel": canal_info.canal + 1,
            "channelZeroBased": canal_info.canal,
            "gmProgram": canal_info.programa_principal,
            "gmInstrument": canal_info.nome_gm,
            "appInstrument": canal_info.instrumento_app,
            "noteCount": canal_info.notas,
            "sectionDetection": "heuristic" if detectar else "disabled",
        },
    }



def criar_midi_temporario_canal(
    midi: "mido.MidiFile",
    canal_alvo: int,
    caminho: Path,
) -> None:
    """
    Cria um MIDI temporário contendo apenas o canal escolhido.
    Mantém mensagens meta, andamento e fórmula de compasso.
    """
    saida = mido.MidiFile(
        type=midi.type,
        ticks_per_beat=midi.ticks_per_beat,
    )

    for trilha_origem in midi.tracks:
        trilha_saida = mido.MidiTrack()
        tempo_pendente = 0

        for msg in trilha_origem:
            tempo_pendente += int(msg.time)

            manter = False

            if msg.is_meta:
                manter = True
            else:
                canal = int(getattr(msg, "channel", -1))

                if canal == canal_alvo:
                    manter = True

            if manter:
                copia = msg.copy(time=tempo_pendente)
                trilha_saida.append(copia)
                tempo_pendente = 0

        if not trilha_saida or trilha_saida[-1].type != "end_of_track":
            trilha_saida.append(
                mido.MetaMessage(
                    "end_of_track",
                    time=tempo_pendente,
                )
            )

        saida.tracks.append(trilha_saida)

    saida.save(str(caminho))


def escolher_canal(
    root: tk.Tk,
    canais: List[CanalInfo],
    midi: "mido.MidiFile",
) -> Optional[int]:
    janela = tk.Toplevel(root)
    janela.title("Ouvir e escolher canal MIDI")
    janela.geometry("880x500")
    janela.minsize(760, 420)

    tk.Label(
        janela,
        text="Ouça uma prévia e selecione somente o canal que deseja converter:",
        font=("Segoe UI", 11, "bold"),
    ).pack(anchor="w", padx=14, pady=(14, 6))

    tk.Label(
        janela,
        text=(
            "A identificação do instrumento é aproximada. "
            "A prévia reproduz apenas o canal selecionado."
        ),
        font=("Segoe UI", 9),
    ).pack(anchor="w", padx=14, pady=(0, 8))

    frame = tk.Frame(janela)
    frame.pack(fill="both", expand=True, padx=14, pady=4)

    scrollbar = tk.Scrollbar(frame)
    scrollbar.pack(side="right", fill="y")

    lista = tk.Listbox(
        frame,
        yscrollcommand=scrollbar.set,
        font=("Consolas", 10),
        selectmode="browse",
        activestyle="dotbox",
    )
    lista.pack(side="left", fill="both", expand=True)
    scrollbar.config(command=lista.yview)

    for info in canais:
        programas = ", ".join(str(p) for p in info.programas)
        texto = (
            f"Canal {info.canal + 1:02d} | "
            f"{info.nome_gm:<26} | "
            f"App: {info.instrumento_app:<10} | "
            f"{info.notas:5d} notas | "
            f"GM: {programas}"
        )
        lista.insert("end", texto)

    lista.selection_set(0)
    lista.activate(0)

    resultado = {"canal": None}
    estado = {
        "tocando": False,
        "arquivo_temp": None,
        "pygame": None,
        "after_id": None,
    }

    status_var = tk.StringVar(value="Nenhuma prévia em reprodução.")
    duracao_var = tk.IntVar(value=15)

    linha_opcoes = tk.Frame(janela)
    linha_opcoes.pack(fill="x", padx=14, pady=(8, 2))

    tk.Label(
        linha_opcoes,
        text="Duração da prévia:",
    ).pack(side="left")

    tk.Spinbox(
        linha_opcoes,
        from_=5,
        to=60,
        increment=5,
        textvariable=duracao_var,
        width=5,
    ).pack(side="left", padx=(6, 4))

    tk.Label(
        linha_opcoes,
        text="segundos",
    ).pack(side="left")

    tk.Label(
        janela,
        textvariable=status_var,
        anchor="w",
        relief="sunken",
        padx=8,
        pady=5,
    ).pack(fill="x", padx=14, pady=(6, 2))

    def limpar_temporario():
        caminho = estado.get("arquivo_temp")

        if caminho:
            try:
                Path(caminho).unlink(missing_ok=True)
            except Exception:
                pass

        estado["arquivo_temp"] = None

    def parar_previa():
        if estado.get("after_id") is not None:
            try:
                janela.after_cancel(estado["after_id"])
            except Exception:
                pass
            estado["after_id"] = None

        pygame_mod = estado.get("pygame")

        if pygame_mod is not None:
            try:
                pygame_mod.mixer.music.stop()
            except Exception:
                pass

        estado["tocando"] = False
        status_var.set("Prévia parada.")
        limpar_temporario()

    def ouvir_previa():
        selecao = lista.curselection()

        if not selecao:
            messagebox.showwarning(
                "Escolha um canal",
                "Selecione um canal antes de ouvir.",
                parent=janela,
            )
            return

        parar_previa()

        info = canais[selecao[0]]

        try:
            import pygame
        except ImportError:
            messagebox.showerror(
                "Biblioteca necessária",
                "Para ouvir a prévia, instale o pygame:\n\n"
                "pip install pygame\n\n"
                "Depois execute o conversor novamente.",
                parent=janela,
            )
            return

        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init()

            arquivo_temp = Path(
                tempfile.gettempdir()
            ) / f"preview_midi_canal_{info.canal + 1}.mid"

            criar_midi_temporario_canal(
                midi,
                info.canal,
                arquivo_temp,
            )

            pygame.mixer.music.load(str(arquivo_temp))
            pygame.mixer.music.play()

            estado["pygame"] = pygame
            estado["arquivo_temp"] = str(arquivo_temp)
            estado["tocando"] = True

            duracao = max(5, min(60, int(duracao_var.get())))

            status_var.set(
                f"Tocando Canal {info.canal + 1:02d} — "
                f"{info.nome_gm} — prévia de {duracao} segundos."
            )

            estado["after_id"] = janela.after(
                duracao * 1000,
                parar_previa,
            )

        except Exception as exc:
            parar_previa()
            messagebox.showerror(
                "Erro ao reproduzir",
                "Não foi possível tocar a prévia MIDI.\n\n"
                f"{exc}\n\n"
                "Em alguns computadores, o pygame pode não encontrar "
                "um sintetizador MIDI compatível.",
                parent=janela,
            )

    def confirmar():
        selecao = lista.curselection()

        if not selecao:
            messagebox.showwarning(
                "Escolha um canal",
                "Selecione o canal que deseja converter.",
                parent=janela,
            )
            return

        parar_previa()
        resultado["canal"] = canais[selecao[0]].canal
        janela.destroy()

    def cancelar():
        parar_previa()
        janela.destroy()

    def ao_duplo_clique(event=None):
        ouvir_previa()

    lista.bind("<Double-Button-1>", ao_duplo_clique)
    lista.bind("<Return>", ao_duplo_clique)

    botoes = tk.Frame(janela)
    botoes.pack(fill="x", padx=14, pady=12)

    tk.Button(
        botoes,
        text="▶ Ouvir canal selecionado",
        command=ouvir_previa,
        width=24,
    ).pack(side="left")

    tk.Button(
        botoes,
        text="■ Parar",
        command=parar_previa,
        width=12,
    ).pack(side="left", padx=(8, 0))

    tk.Button(
        botoes,
        text="Converter canal selecionado",
        command=confirmar,
        width=28,
    ).pack(side="right")

    tk.Button(
        botoes,
        text="Cancelar",
        command=cancelar,
        width=12,
    ).pack(side="right", padx=(0, 8))

    janela.protocol("WM_DELETE_WINDOW", cancelar)
    janela.transient(root)
    janela.grab_set()
    root.wait_window(janela)

    return resultado["canal"]


def salvar_json(caminho: Path, conteudo: dict) -> None:
    caminho.write_text(
        json.dumps(conteudo, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def executar_conversao(root: tk.Tk, registrar) -> None:
    registrar("Iniciando o fluxo de conversão.")
    root.update_idletasks()

    registrar("Abrindo a caixa de seleção do arquivo MIDI.")
    arquivo_midi = filedialog.askopenfilename(
        title="Selecione o arquivo MIDI",
        filetypes=[
            ("Arquivos MIDI", "*.mid *.midi"),
            ("Todos os arquivos", "*.*"),
        ],
    )

    if not arquivo_midi:
        registrar("Seleção do MIDI cancelada pelo usuário.")
        return

    registrar(f"Arquivo selecionado: {arquivo_midi}")

    try:
        registrar("Tentando abrir e interpretar o arquivo MIDI.")
        midi = mido.MidiFile(arquivo_midi)
        registrar(
            f"MIDI aberto: tipo={midi.type}, trilhas={len(midi.tracks)}, "
            f"ticks_por_batida={midi.ticks_per_beat}."
        )
    except Exception as exc:
        messagebox.showerror(
            "Erro",
            f"Não foi possível abrir o MIDI:\n\n{exc}",
        )
        return

    registrar("Analisando canais e programas General MIDI.")
    canais = analisar_canais(midi)
    registrar(f"Canais com notas encontrados: {len(canais)}.")

    for item in canais:
        registrar(
            f"Canal {item.canal + 1}: {item.nome_gm}; "
            f"{item.notas} notas; app={item.instrumento_app}."
        )

    if not canais:
        messagebox.showwarning(
            "Sem notas",
            "Nenhum canal com notas foi encontrado.",
        )
        return

    registrar("Lendo andamento e fórmula de compasso.")
    tempo, numerador, denominador = obter_tempo_compasso(midi)
    bpm_detectado = float(mido.tempo2bpm(tempo))
    registrar(
        f"BPM detectado={bpm_detectado:.3f}; "
        f"compasso={numerador}/{denominador}."
    )

    registrar("Abrindo pergunta para o nome da música.")
    nome_musica = simpledialog.askstring(
        "Nome da música",
        "Digite o nome da música:",
        initialvalue=Path(arquivo_midi).stem,
        parent=root,
    )

    if nome_musica is None:
        return

    nome_musica = nome_musica.strip() or Path(arquivo_midi).stem

    registrar("Abrindo pergunta para o BPM.")
    bpm = simpledialog.askfloat(
        "BPM",
        "Informe o BPM que será gravado no JSON:",
        initialvalue=bpm_detectado,
        minvalue=1,
        parent=root,
    )

    if bpm is None:
        return

    registrar("Perguntando sobre detecção automática de seções.")
    detectar = messagebox.askyesno(
        "Detectar seções",
        "Deseja que o conversor tente identificar estrofes, "
        "pré-refrão, refrão e outras seções?\n\n"
        "A identificação é aproximada e deve ser revisada depois.",
        parent=root,
    )

    registrar(f"Detecção de seções: {detectar}.")
    registrar("Perguntando sobre inclusão de pausas.")
    incluir_pausas = messagebox.askyesno(
        "Incluir pausas",
        "Deseja incluir eventos de pausa entre as notas?",
        parent=root,
    )

    registrar(f"Incluir pausas: {incluir_pausas}.")
    registrar("Perguntando como tratar notas simultâneas.")
    politica = simpledialog.askstring(
        "Notas simultâneas",
        "Quando várias notas começarem juntas, qual usar?\n\n"
        "mais-alta\n"
        "mais-baixa\n"
        "primeira",
        initialvalue="mais-alta",
        parent=root,
    )

    if politica is None:
        return

    politica = politica.strip().lower()

    if politica not in ("mais-alta", "mais-baixa", "primeira"):
        politica = "mais-alta"

    ticks_por_compasso = (
        midi.ticks_per_beat
        * numerador
        * (4 / denominador)
    )

    registrar(
        f"Configuração concluída. Política de polifonia: {politica}."
    )
    registrar("Abrindo a janela de prévia e seleção do canal.")

    # A janela de prévia aparece sempre antes da conversão.
    canal_escolhido = escolher_canal(root, canais, midi)

    if canal_escolhido is None:
        registrar("Janela de canais fechada sem seleção.")
        return

    registrar(f"Canal escolhido para conversão: {canal_escolhido + 1}.")

    registrar("Prosseguindo somente com o canal escolhido.")

    info = next(
        item for item in canais
        if item.canal == canal_escolhido
    )

    if info.bateria:
        messagebox.showwarning(
            "Canal de bateria",
            "O canal selecionado é o canal 10 de bateria General MIDI.\n\n"
            "O formato atual de notas isoladas não converte bateria "
            "corretamente. Escolha outro canal.",
            parent=root,
        )
        return

    registrar("Extraindo as notas do canal escolhido.")
    notas = extrair_notas_canal(midi, canal_escolhido)
    registrar(f"Notas extraídas: {len(notas)}.")

    if not notas:
        messagebox.showwarning(
            "Sem notas",
            "Nenhuma nota utilizável foi encontrada nesse canal.",
            parent=root,
        )
        return

    resultado = criar_json_canal(
        nome_musica=nome_musica,
        bpm=bpm,
        canal_info=info,
        notas=notas,
        ticks_por_compasso=ticks_por_compasso,
        incluir_pausas=incluir_pausas,
        politica=politica,
        detectar=detectar,
    )

    sugestao = sanitizar_nome(
        f"{Path(arquivo_midi).stem}-canal-{info.canal + 1:02d}-"
        f"{info.nome_gm}.json"
    )

    registrar("Abrindo a caixa para salvar o JSON.")
    arquivo_saida = filedialog.asksaveasfilename(
        title="Salvar JSON",
        defaultextension=".json",
        initialfile=sugestao,
        filetypes=[
            ("Arquivo JSON", "*.json"),
            ("Todos os arquivos", "*.*"),
        ],
    )

    if not arquivo_saida:
        return

    try:
        registrar(f"Salvando JSON em: {arquivo_saida}")
        salvar_json(Path(arquivo_saida), resultado)
        registrar("JSON salvo com sucesso.")
    except Exception as exc:
        messagebox.showerror(
            "Erro ao salvar",
            f"Não foi possível salvar o JSON:\n\n{exc}",
            parent=root,
        )
        return

    secoes_ativas = [
        secao for secao in ORDEM_SECOES
        if resultado["sections"][secao]
    ]

    messagebox.showinfo(
        "Conversão concluída",
        "JSON criado com sucesso!\n\n"
        f"Canal: {info.canal + 1}\n"
        f"Instrumento identificado: {info.nome_gm}\n"
        f"Instrumento no app: {info.instrumento_app}\n"
        f"Notas MIDI: {info.notas}\n"
        f"Seções sugeridas: {len(secoes_ativas)}\n\n"
        f"Arquivo:\n{arquivo_saida}",
        parent=root,
    )



def main() -> None:
    """
    Abre uma janela de diagnóstico visível antes de qualquer caixa de diálogo.
    Tudo o que acontecer também é registrado em um arquivo .log.
    """
    try:
        pasta_script = Path(__file__).resolve().parent
    except Exception:
        pasta_script = Path.cwd()

    caminho_log = pasta_script / "midi_conversor_debug.log"

    try:
        caminho_log.write_text("", encoding="utf-8")
    except Exception:
        caminho_log = Path(tempfile.gettempdir()) / "midi_conversor_debug.log"
        caminho_log.write_text("", encoding="utf-8")

    root = tk.Tk()
    root.title("Conversor MIDI — diagnóstico")
    root.geometry("850x560")
    root.minsize(720, 460)

    titulo = tk.Label(
        root,
        text="Conversor MIDI para JSON — modo de diagnóstico",
        font=("Segoe UI", 13, "bold"),
    )
    titulo.pack(anchor="w", padx=14, pady=(14, 4))

    subtitulo = tk.Label(
        root,
        text=(
            "Esta janela ficará aberta e mostrará cada etapa executada. "
            "O arquivo de log também será salvo ao lado do programa."
        ),
        justify="left",
        wraplength=800,
    )
    subtitulo.pack(anchor="w", padx=14, pady=(0, 8))

    frame_texto = tk.Frame(root)
    frame_texto.pack(fill="both", expand=True, padx=14, pady=6)

    barra = tk.Scrollbar(frame_texto)
    barra.pack(side="right", fill="y")

    console = tk.Text(
        frame_texto,
        yscrollcommand=barra.set,
        wrap="word",
        font=("Consolas", 9),
        state="disabled",
    )
    console.pack(side="left", fill="both", expand=True)
    barra.config(command=console.yview)

    status_var = tk.StringVar(value="Aguardando início.")
    status = tk.Label(
        root,
        textvariable=status_var,
        anchor="w",
        relief="sunken",
        padx=8,
        pady=5,
    )
    status.pack(fill="x", padx=14, pady=(2, 8))

    def registrar(mensagem: str) -> None:
        horario = datetime.now().strftime("%H:%M:%S")
        linha = f"[{horario}] {mensagem}"

        print(linha, flush=True)

        try:
            with caminho_log.open("a", encoding="utf-8") as arquivo:
                arquivo.write(linha + "\n")
        except Exception:
            pass

        try:
            console.config(state="normal")
            console.insert("end", linha + "\n")
            console.see("end")
            console.config(state="disabled")
            status_var.set(mensagem)
            root.update_idletasks()
        except Exception:
            pass

    em_execucao = {"valor": False}

    def iniciar():
        if em_execucao["valor"]:
            registrar("O fluxo já está em execução.")
            return

        em_execucao["valor"] = True
        botao_iniciar.config(state="disabled")

        try:
            registrar("=" * 65)
            registrar("Botão 'Iniciar seleção do MIDI' acionado.")
            executar_conversao(root, registrar)
            registrar("Fluxo encerrado sem erro não tratado.")
        except BaseException as exc:
            detalhes = traceback.format_exc()
            registrar(f"ERRO NÃO TRATADO: {type(exc).__name__}: {exc}")
            registrar(detalhes)

            try:
                messagebox.showerror(
                    "Erro no conversor",
                    "Ocorreu um erro.\n\n"
                    f"{type(exc).__name__}: {exc}\n\n"
                    f"O diagnóstico foi salvo em:\n{caminho_log}",
                    parent=root,
                )
            except Exception:
                pass
        finally:
            em_execucao["valor"] = False
            botao_iniciar.config(state="normal")
            status_var.set("Fluxo finalizado. Consulte o diagnóstico acima.")

    def abrir_log():
        try:
            import os
            os.startfile(str(caminho_log))
        except Exception as exc:
            registrar(f"Não foi possível abrir o log: {exc}")
            messagebox.showinfo(
                "Local do log",
                str(caminho_log),
                parent=root,
            )

    botoes = tk.Frame(root)
    botoes.pack(fill="x", padx=14, pady=(0, 14))

    botao_iniciar = tk.Button(
        botoes,
        text="Iniciar seleção do MIDI",
        command=iniciar,
        width=24,
        height=2,
    )
    botao_iniciar.pack(side="left")

    tk.Button(
        botoes,
        text="Abrir arquivo de diagnóstico",
        command=abrir_log,
        width=26,
    ).pack(side="left", padx=(8, 0))

    tk.Button(
        botoes,
        text="Fechar",
        command=root.destroy,
        width=12,
    ).pack(side="right")

    registrar("Programa iniciado.")
    registrar(f"Python: {sys.version.split()[0]}")
    registrar(f"Sistema: {platform.platform()}")
    registrar(f"Arquivo executado: {Path(__file__).resolve()}")
    registrar(f"Log: {caminho_log}")
    registrar("Clique em 'Iniciar seleção do MIDI' para continuar.")

    root.mainloop()


if __name__ == "__main__":
    try:
        main()
    except BaseException as exc:
        detalhes = traceback.format_exc()
        print(detalhes, file=sys.stderr, flush=True)

        try:
            pasta = Path(__file__).resolve().parent
            emergencia = pasta / "midi_conversor_erro_inicial.log"
            emergencia.write_text(detalhes, encoding="utf-8")
            print(
                f"Diagnóstico de emergência salvo em: {emergencia}",
                file=sys.stderr,
                flush=True,
            )
        except Exception:
            pass
