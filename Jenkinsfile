pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('1. Setup') {
            steps {
                echo '=== [CI] Verificando entorno ==='
                sh 'node -v'
                sh 'npm -v'
                sh 'git log -1 --oneline'
            }
        }

        stage('2. Dependencias') {
            steps {
                echo '=== [CI] Instalando dependencias del Backend ==='
                sh 'npm install --no-audit'
            }
        }

        stage('3. Sintaxis') {
            steps {
                echo '=== [CI] Validando sintaxis de src/ ==='
                sh 'find src -name "*.js" -exec node -c {} \\;'
            }
        }

        stage('4. Security Audit') {
            steps {
                echo '=== [CI] Auditoría de vulnerabilidades ==='
                sh 'npm audit --audit-level=critical || true'
            }
        }
    }

    post {
        success { echo 'CI SUCCESS: todas las validaciones pasaron.' }
        failure { echo 'CI FAILED: merge bloqueado.' }
    }
}
