from datetime import datetime
from typing import Any

from rich.console import Console

console = Console()


def log_info(message: Any, log_file: str = "log.txt"):
    """
    Logs an info message to the console and a log file.
    """
    console.print(message, style="bold green")
    with open(log_file, "a") as f:
        _ = f.write(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} INFO] {message}\n"
        )


def log_warning(message: Any, log_file: str = "log.txt"):
    """
    Logs a warning message to the console and a log file.
    """
    console.print(message, style="bold yellow")
    with open(log_file, "a") as f:
        _ = f.write(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} WARNING] {message}\n"
        )


def log_error(message: Any, log_file: str = "log.txt"):
    """
    Logs an error message to the console and a log file.
    """
    console.print(message, style="bold red")
    with open(log_file, "a") as f:
        _ = f.write(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ERROR] {message}\n"
        )


def log_success(message: Any, log_file: str = "log.txt"):
    """
    Logs a success message to the console and a log file.
    """
    console.print(message, style="bold blue")
    with open(log_file, "a") as f:
        _ = f.write(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} SUCCESS] {message}\n"
        )
