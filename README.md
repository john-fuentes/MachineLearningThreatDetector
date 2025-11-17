# Project Title

## 📖 Overview
This project sets up a logging system using a virtual machine, Auditd, Filebeat, Kafka, and a Python server.  
It's designed to collect and process logs, sending them over the network for analysis.

---

## 🚀 Getting Started

### Prerequisites
- **VirtualBox**  
- **Linux Ubuntu LTS**  
- **Docker Desktop**  
- **IntelliJ Ultimate** (or another code editor of your choice)  

---

## 🛠️ Step-by-Step Guide

### Step 1: Setting Up the Virtual Machine
1. Download and install **[VirtualBox](https://www.virtualbox.org/)**  
2. Download the **[Linux Ubuntu LTS](https://ubuntu.com/download/desktop)** ISO image.  
3. For a guided walkthrough, check out this [YouTube tutorial](https://www.youtube.com/watch?v=z9KRDc4j3oI&t=850s&ab_channel=ExplainingComputers).  

---

### Step 2: Configuring the Logging System 🪵
1. **Install and set up Auditd** — This is the primary logging tool.  
2. **Define logging rules** — Configure Auditd to specify which system events you want to log.  
3. **Install Filebeat** — This will ship your logs to Kafka.  
4. **Set up `filebeat.yml`:**  
   - Delete the `output.elasticsearch:` section.  
   - Create a new `output.kafka:` section to direct logs to your Kafka instance.  
5. **Test your configuration** — Ensure that Filebeat is running correctly and that logs are being sent as expected.  

---

### Step 3: Setting Up the Python Server 🐍
1. **Clone the GitHub repository** - You can use GitHub Desktop to make it easier.  
2. **Install Docker Desktop** — This is necessary to run Kafka.
3. **Start Kafka** — Run the following command in your terminal:
  - docker-compose up

### Step 4: Sending Logs Over The Network 🌐
1. **Update IP addresses** - You may need to change the IP address in docker-compose.yml, filebeat.yml, and app.py to your machine's IP address. 
2. **Find your IP address** — Use ipconfig (Windows) or ifconfig/ip addr (Linux/macOS) in your terminal.
3. **Test the setup** — Run app.py. If everything is configured correctly, you should see logs printed to your console and accessible at http://localhost:5000.
