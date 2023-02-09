# This is a simple script to update my Elk instance, you can ignore it

docker build . -t elk
docker image save elk -o elk.tar

echo 'Copying Docker image...'
scp elk.tar ubuntu@raspi:/home/ubuntu/docker/build/elk.tar

echo 'Stopping, loading and starting...'
ssh ubuntu@raspi 'cd /home/ubuntu/docker && sudo docker compose stop elk && sudo docker image load -i /home/ubuntu/docker/build/elk.tar && rm /home/ubuntu/docker/build/elk.tar && cd /home/ubuntu/docker && sudo docker compose up -d'

# Cleanup
rm elk.tar