"""
简单 YouTube 下载器 - 基于 yt-dlp
用法:
  python downloader.py <URL>              # 下载视频(最佳画质)
  python downloader.py <URL> --mp3        # 仅下载音频(MP3)
  python downloader.py <URL> --list       # 列出可选格式
  python downloader.py <URL> -f 22        # 下载指定格式
"""

import sys
import os
import yt_dlp


def get_output_dir():
    """下载目录: 脚本同级的 downloads 文件夹"""
    d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
    os.makedirs(d, exist_ok=True)
    return d


def progress_hook(d):
    if d["status"] == "downloading":
        pct = d.get("_percent_str", "N/A")
        speed = d.get("_speed_str", "N/A")
        eta = d.get("_eta_str", "N/A")
        print(f"\r  下载中: {pct}  速度: {speed}  剩余: {eta}", end="", flush=True)
    elif d["status"] == "finished":
        print("\n  下载完成，正在处理...")


def download_video(url, format_id=None):
    """下载视频（最佳画质+音频合并）"""
    opts = {
        "format": format_id or "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "postprocessors": [{
            "key": "FFmpegVideoConvertor",
            "preferedformat": "mp4",
        }],
        "outtmpl": os.path.join(get_output_dir(), "%(title)s.%(ext)s"),
        "progress_hooks": [progress_hook],
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])


def download_mp3(url):
    """仅下载音频并转为 MP3"""
    opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(get_output_dir(), "%(title)s.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
        "progress_hooks": [progress_hook],
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])


def list_formats(url):
    """列出视频可选格式"""
    opts = {"listformats": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    url = sys.argv[1]
    args = sys.argv[2:]

    print(f"目标: {url}\n")

    if "--list" in args:
        list_formats(url)
    elif "--mp3" in args:
        print("模式: 音频 MP3")
        download_mp3(url)
        print(f"✓ 已保存到 {get_output_dir()}")
    else:
        fmt = None
        if "-f" in args:
            idx = args.index("-f")
            if idx + 1 < len(args):
                fmt = args[idx + 1]
        print(f"模式: 视频 {'(格式 ' + fmt + ')' if fmt else '(最佳画质)'}")
        download_video(url, fmt)
        print(f"✓ 已保存到 {get_output_dir()}")


if __name__ == "__main__":
    main()
