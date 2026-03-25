pipeline {
  agent any

  tools {
    jdk 'JDK17'
    maven 'Maven3'
    nodejs 'node18'
  }

  environment {
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
    SONAR_PROJECT_KEY_BACKEND = 'backend-app'
    SONAR_PROJECT_KEY_FRONTEND = 'frontend-app'
  }

  stages {

    stage('Checkout') {
      steps {
        dir('backend') {
          git url: 'https://github.com/cheikhi51/Task-Manager-Backend.git',
              branch: 'main',
              credentialsId: 'git-creds'
        }
        dir('frontend') {
          git url: 'https://github.com/cheikhi51/Task-Manager-Frontend.git',
              branch: 'main',
              credentialsId: 'git-creds'
        }
        dir('terraform'){
          git url: 'https://github.com/cheikhi51/Task-manager-infra.git',
              branch: 'main',
              credentialsId: 'git-creds'
        }
      }
    }

    stage('Backend Build & Test') {
      steps {
        dir('backend') {
          withCredentials([
            string(credentialsId: 'postgres-db-url', variable: 'DB_URL'),
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
            string(credentialsId: 'jwt-expiration', variable: 'JWT_EXPIRATION'),
            usernamePassword(
              credentialsId: 'postgres-db-credentials',
              usernameVariable: 'DB_USERNAME',
              passwordVariable: 'DB_PASSWORD'
            )
          ]) {
            bat '''
              set DB_DRIVER_CLASS_NAME=org.postgresql.Driver
              set DB_URL=%DB_URL%
              set DB_USERNAME=%DB_USERNAME%
              set DB_PASSWORD=%DB_PASSWORD%
              set JWT_SECRET=%JWT_SECRET%
              set JWT_EXPIRATION=%JWT_EXPIRATION%
              mvn clean compile
            '''
          }
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          bat '''
            npm install
            npm run build
          '''
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          dir('backend') {
            bat '''
              mvn sonar:sonar ^
              -Dsonar.projectKey=%SONAR_PROJECT_KEY_BACKEND%
            '''
          }
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        bat '''
          docker build -t mohamed510/task-manager-backend:latest backend
          docker build -t mohamed510/task-manager-frontend:latest frontend
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        bat '''
          echo %DOCKERHUB_CREDS_PSW% | docker login -u %DOCKERHUB_CREDS_USR% --password-stdin
          docker push mohamed510/task-manager-backend:latest
          docker push mohamed510/task-manager-frontend:latest
        '''
      }
    }

    stage('Terraform Apply') {
      steps {
        dir('terraform') {
          bat """
            terraform init
            terraform apply -auto-approve -var="namespace=%NAMESPACE%"
          """
        }
      }
    }

  }

  post {
    success {
      echo '========================================='
      echo 'Pipeline completed successfully! ✅'
      echo '========================================='
    }
    failure {
      echo '========================================='
      echo 'Pipeline failed! ❌'
      echo 'Check the logs above for error details.'
      echo '========================================='
    }
    always {
      echo 'Cleaning up...'
    }
  }
}